/**
 * @file 控制器
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var assert = require('winnie/lib/assert');
    var util = require('winnie/lib/util');
    var Action = require('./action');
    var URL = require('./URL');
    var Promise = require('winnie/lib/Promise');

    function Controller() {
        this.currentURL = null;
        this.currentAction = null;
        this.globalActionLoader = null;
        this.actionPathMapping = {};

    }

    /**
     * 注册一个或一系列Action
     * @param {Array.<Object>|Object} actionConfigs Action的相关配置
     * @example
     * action : {
     *  path:'/list',
     *  action: require('./list/hot')
     *
     * }
     */
    Controller.prototype = {
        constructor: Controller,
        registerAction: function (actionConfigs) {

            var actionConfig;

            if (!util.isArray(actionConfigs)) {
                actionConfigs = [actionConfigs];
            }

            for (var i = 0; i < actionConfigs.length; i++) {
                actionConfig = actionConfigs[i];
                assert.hasProperty(actionConfig, 'path', 'action config should has a path');
                this.actionPathMapping[actionConfig.path] = actionConfig;
            }

            this.getRouter().setBackup(util.bind(this.renderAction, this));
        },

        start: function () {

        },

        renderAction: function (url, config) {
            if (util.isString(url)) {
                url = URL.parse(url);
            }

            this.globalActionLoader = this.forward(url, this.getMainContainer(), config);

            return this.globalActionLoader
                .then(util.bind(this.enterAction, this))
                .fail(util.bind(this.getEvents().notifyError, this.getEvents()));
        },

        getMainContainer: function () {
            return this.mainContainer;
        },

        setMainContainer: function (main) {
            this.mainContainer = main;
        },

        forward: function (url, container) {

            var actionContext = {
                url: url,
                container: container
            };

            actionContext.referrer = this.currentURL;

            actionContext.args = util.extend({}, actionContext);

            actionContext.args.query = url.getQuery();


            this.getEvents().fire('forwardAction', util.extend({
                controller: this
            }, actionContext));

            var loader = this.loadAction(actionContext);

            assert.has(loader, 'loader should return a Promise');

            return loader;

        },

        /**
         * 执行action
         * @param {Object} value 值
         * @param {Action} value.action Action实例
         * @param {ActionContext} value.actionContext Action执行的上下文
         */
        enterAction: function (value) {
            var me = this;
            var action = value.action;
            var actionContext = value.actionContext;

            if (actionContext.url !== this.currentURL) {
                return;
            }

            // 如果先前有Action，则执行它的leave事件
            if (this.currentAction) {
                if (typeof this.currentAction.leave === 'function') {
                    this.currentAction.leave();
                }
            }

            this.currentAction = action;


            function complete() {
                this.getEvents().fire('enterActionComplete', util.mix({
                    controller: me,
                    action: action
                }, actionContext));
            }

            function fail() {
                this.getEvents().fire('enterActionFail', util.mix({
                    controller: me,
                    action: action
                }, actionContext));
            }


            var entering = action.enter(actionContext);

            entering.then(complete, fail);
        },

        findActionConfig: function (actionContext) {
            return this.actionPathMapping[actionContext.url.getPath()];
        },
        /**
         * 根据URL加载对应的Action对象
         *
         * @param {ActionContext} actionContext 调用Action的初始化参数
         * @return {Promise} 如果有相应的Action配置，返回一个Promise对象。
         * 如果正确创建了{@link Action}对象，则该Promise对象进入`resolved`状态。
         * 如果没找到{@link Action}的配置或者加载{@link Action}失败，则该Promise进入`rejected`状态
         * @protected
         */
        loadAction: function (actionContext) {
            var actionConfig = this.findActionConfig(actionContext);

            if (!actionConfig) {
                return Promise.reject('no action configured for url ' + actionContext.url.getPath());
            }
            var callback;
            var aborted = false;

            this.currentURL = actionContext.url;

            var loaderPromise = new Promise(function (resolve, reject) {
                callback = function (action) {
                    var Constructor;

                    if (aborted) {
                        return;
                    }

                    if (!action) {
                        var reason = 'no action implement for' + action.action;
                        reject(reason);
                        return;
                    }

                    if (actionConfig.action && actionConfig.action.constructor !== Object) {
                        Constructor = actionConfig.action.constructor;
                    }
                    else {
                        Constructor = Action;
                    }

                    action = new Constructor(actionConfig.action);
                    resolve({
                        action: action,
                        actionContext: actionContext
                    });
                };
            });

            // action为字符串
            if (util.isString(actionConfig.action)) {
                // 注意是全局的require
                window.require([actionConfig.action], callback);
            }
            else {
                callback(actionConfig.action);
            }


            return loaderPromise;
        },
        getRouter: function () {
            return this.router;
        },
        setRouter: function (router) {
            this.router = router;
        },
        setEvents: function (events) {
            this.events = events;
        },
        getEvents: function () {
            return this.events;
        }
    };

    var instance = new Controller();

    instance.setRouter(require('./router'));
    instance.setEvents(require('./events'));


    instance.Controller = Controller;

    return instance;
});
