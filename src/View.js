/**
 * @file View
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var Abstract = require('./Abstract');
    var util = require('winnie/lib/util');
    var lib = require('winnie');
    var etpl = require('etpl');

    /**
     * 编译模板
     * @param {View} view 视图实例
     * @param {string|Array.<string>} str 模板字符串或数组
     */
    function compileTemplate(view, str) {
        if (!util.isArray(str)) {
            str = [str];
        }

        str = str.join('');

        var tplEngine = new etpl.Engine();

        // 拷贝etpl命名空间的filter、配置
        tplEngine.options = etpl.options;
        tplEngine.filters = etpl.filters;

        // 保存默认render
        var defaultRender = tplEngine.compile(str);

        // 保存原始的render
        var orgRender = tplEngine.render;

        view.template = tplEngine;

        view.template.render = function (name, data) {
            var res = '';

            // 如果只有一个参数 或者target为null
            // 则使用默认render
            if (arguments.length < 2 || !name) {
                res = defaultRender(name || data);
            }
            else {
                res = orgRender.call(this, name, data);
            }

            return res;
        };

    }

    var View = Abstract.extend({

        initialize: function (options) {
            View.superClass.initialize.call(this, options);
            this.init();
        },

        init: function () {
            this.template = this.template || '';

            if (util.isArray(this.template) || util.isString(this.template)) {
                compileTemplate(this, this.template);
            }

            // 绑定了事件的DOM元素集合
            // 用于View销毁时卸载事件绑定
            this.bindElements = [];

            View.superClass.init.call(this);

        },
        /**
         * 渲染视图
         *
         * @public
         * @param {Object} data 数据
         *
         * @fires View#beforerender
         *        View#afterrender
         */
        render: function (data) {
            if (!this.main) {
                return;
            }

            /**
             * 渲染前事件
             *
             * @event
             * @param {Object} 渲染数据
             */
            this.fire('beforeRender', data);

            // this.template 是模板引擎的实例
            this.main.innerHTML = this.template.render(this.templateMainTarget, data);

            /**
             * 渲染前事件
             *
             * @event
             * @param {Object} 渲染数据
             */
            this.fire('afterRender', data);

        },
        /**
         * 视图就绪
         * 主要进行事件绑定
         *
         * @public
         * @fires View#ready
         */
        ready: function () {
            bindDomEvents(this);
            this.emit('ready', this);
        },
        /**
         * 设置容器主元素
         * @param {HTMLElement} ele
         */
        setMain: function (ele) {
            this.main = ele;
        },
        /**
         * 委托事件
         * @param {HTMLElement} node
         * @param {string} type
         * @param {string} selector
         * @param {Function} fn
         */
        addDomEvent: function (node, type, selector, fn) {
            if (util.inArray(node, this.bindElements)) {
                this.bindElements.push(node);
            }

            lib.on(node, type, selector, util.bind(fn,this));
        },

        /**
         * 视图销毁
         *
         * @public
         * @fires View#dispose
         */
        dispose: function () {
            /**
             * 视图销毁事件
             *
             * @event
             */
            this.emit('dispose');

            // 解除事件绑定
            util.each(this.bindElements, function (ele) {
                lib.off(ele);
            });

            this.bindElements = [];

            // 解除元素引用
            this.main = null;
        }
    });

    /**
     * 绑定dom事件
     * @param {View} view 视图实例
     */
    function bindDomEvents(view) {
        var type;
        var selector;
        var fn;
        var events = view.domEvents || {};
        util.each(util.keys(events), function (name) {
            fn = events[name];
            name = name.split(':');
            type = util.trim(name[0]);
            selector = name[1] ? util.trim(name[1]) : undefined;
            view.addDomEvent(view.main, type, selector, fn);

        });
    }

    return View;
});
