/**
 * @file router 路由器对象
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var URL = require('./URL');
    var events = require('./events');

    /**
     * Router
     * 路由用于将特定的URL对应到特定的函数上，
     * 并在URL变化（locator对象支持）时，执行相应的函数
     * @constructor
     */
    function Router() {
        this.rules = [];
    }

    Router.prototype = {
        constructor: Router,

        /**
         * 添加一条路由规则
         *
         * @param {string | RegExp} path 匹配URL的`path`部分的字符串或正则表达式
         * @param {Function} handler 匹配成功时执行的函数
         */
        addRule: function (path, handler) {
            this.rules.push({
                path: path,
                handler: handler
            });
        },
        /**
         * 设置locator对象
         * @param {locator} locator locator实例
         */
        setLocator: function (locator) {
            this.locator = locator;
        },
        /**
         * 获取locator对象
         * @protected
         * @return {locator|*}
         */
        getLocator: function () {
            return this.locator;
        },
        setBackup: function (handler) {
            this.backup = handler;
        },
        start: function () {
            this.getLocator().on('redirect', executeRoute, this);
        }
    };

    /**
     * 在{{@locator#redirect}事件中，执行路由逻辑
     *
     * @param {Object} e 事件对象
     * @param {string} e.url 当前的URL
     * @param {string} e.referrer 先前的URL
     * @ignore
     */
    function executeRoute(e) {
        var url = URL.parse(e.url); // 解析url
        var path = url.getPath();

        for (var i = 0; i < this.rules.length; i++) {
            var rule = this.rules[i];
            if (rule.path instanceof RegExp && rule.path.test(path) || rule.path === path) {
                rule.handler.call(this, url);
                return;
            }
        }

        if (this.backup) {
            this.backup(url);
        }

        events.fire('router', {
            url: url,
            router: this
        });


    }

    var instance = new Router();

    instance.setLocator(require('./locator'));

    instance.Router = Router;

    return instance;
});
