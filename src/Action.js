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
         * @param {string} path 当前的访问路径
         * @param {Object} query 查询条件
         * @param {HTMLElement} main 视图容器
         * @param {Object} options action配置
         */
        enter: function (path, query, main, options) {
            this.path = path;
            this.options = util.extend({}, options);

            this.view.setMain(main);

            this.emit('enter');

            // 通过model发起请求，获取数据
            return this.model.fetch(query)
                .then(util.bind(this.createView, this));
        },
        /**
         * 加载完Model后，进入View相关的逻辑
         *
         * @protected
         */
        createView: function(data) {

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

        }
    });

    return Action;
});
