/**
 * @file Action
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var Abstract = require('./Abstract');
    var View = require('./View');
    var Model = require('./Model');
    var util = require('winnie/lib/util');


    var Action = Abstract.extend({

        initialize: function (options) {
            Action.superClass.initialize.call(this, options);
            this.init();
            this.emit('init');
            this.disposed = false;
        },

        /**
         * 初始化
         * @public
         * 进行view和model与Action的关联
         */
        init: function () {
            var Constructor;

            // 传入view对象，但view申明构造函数
            if (this.view && this.view.constructor !== Object) {
                Constructor = this.view.constructor;
            }
            else {
                Constructor = View; // 默认调用框架的View类
            }

            this.view = new Constructor(this.view); // this.view 为object形式的option

            if (this.model && this.model.constructor !== Object) {
                Constructor = this.model.constructor;
            }
            else {
                Constructor = Model;
            }

            this.model = new Constructor(this.model);

            Action.superClass.init.call(this);
        },

        /**
         * 加载页面
         *
         * 页面入口
         * 完成数据请求，页面渲染
         *
         * @public
         * @param {ActionContext} actionContext Action的上下文
         * @param {URL} actionContext.url 当前的URL对象
         * @param {Object} actionContext.query 查询条件
         * @param {HTMLElement} actionContext.container 视图容器
         * @param {Object} actionContext.options action配置
         * @return {Promise}
         */
        enter: function (actionContext) {

            this.view.setContainer(actionContext.container);

            this.emit('enter');

            var args = util.extend({}, actionContext && actionContext.args);

            if (this.model) {
                this.model.fill(args);
            }


            // 通过model发起请求，获取数据
            return this.model.fetch(args.query).then(
                util.bind(this.createView, this),
                util.bind(this.reportError, this)
            );
        },
        /**
         * 离开当前Action，清理Model和View
         *
         * @protected
         * @fires beforeLeave
         * @fires leave
         * @return {?Action}
         */
        leave: function () {
            // 如果已经销毁了就别再继续下去
            if (this.disposed) {
                return this;
            }

            this.disposed = true;

            this.fire('beforeLeave', this);

            if (this.model) {
                if (typeof this.model.dispose === 'function') {
                    this.model.dispose();
                }
                this.model = null;
            }

            if (this.view) {
                if (typeof this.view.dispose === 'function') {
                    this.view.dispose();
                }
                this.view = null;
            }

            /**
             * @event leave
             *
             * 离开Action后触发
             */
            this.fire('leave');


            // 消除所有绑定的事件，这是emitter的方法
            this.off();

        },
        /**
         * 加载完Model后，进入View相关的逻辑
         *
         * @protected
         * @param {Object=} data 模型数据
         * @return {?Action}
         */
        createView: function (data) {

            if (this.disposed) {
                return this;
            }
            /**
             * @event beforeRender
             *
             * 视图开始渲染时触发
             */
            this.fire('beforeRender');

            this.view.render(data);

            /**
             * @event afterRender
             *
             * 视图开始渲染时触发
             */
            this.fire('afterRender');

            // 初始化试图交互
            this.view.ready();


            /**
             * @event enterComplete
             *
             * Action进入完毕后触发
             */
            this.fire('enterComplete');

        },
        /**
         * 报告错误
         * @param {string|Object} reason 错误信息
         * @return {Error}
         */
        reportError: function (reason) {
            var errors = [];
            var item;
            for (var i = 0; i < arguments.length; i++) {
                item = arguments[i];
                if (item) {
                    errors.push(errors);
                }
            }

            return this.handleError(errors);
        },
        /**
         * 处理错误
         * @override
         * @param {Array} errors 错误数组
         */
        handleError: function (errors) {
            throw  errors;
        }
    });

    return Action;
});
