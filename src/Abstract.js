/**
 * @file Abstract 抽象类
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var Class = require('winnie/lib/class');
    var util = require('winnie/lib/util');
    var Emitter = require('winnie/lib/emitter');

    var Abstract = Class.create({
        initialize: function (options) {
            options = options || {};
            util.extend(this, options);
            Emitter.mixTo(this);
        },
        /**
         * 默认实例的调用的方法
         */
        init: function () {
            bindEvents(this);
        },

        /**
         * 提供给子类覆盖的方法
         * @override
         * @public
         */
        dispose: function () {
            this.off();
        }

    });

    /**
     * 绑定事件，包括绑定组件事件和实例的事件
     * @param {Abstract} host 对象实例
     * @param {Object} host.events 事件对象
     * @inner
     * @example
     * enter: function () {
     *   // do something
     * }
     * view:show:function(){
     *  // do something
     * }
     */
    function bindEvents(host) {
        var events = host.events || {};
        var fn;

        util.each(util.keys(events), function (name) {
            fn = events[name];

            // 有：表示是组件的事件
            if (name.indexOf(':') > 0) {
                var items = name.split(':');
                var item = util.trim(items[0]);

                // 得到事件名称
                name = items[1] && util.trim(items[1]);
                if (item && host[item] && name) {
                    host[item].on(name, util.bind(fn, host));
                }
            }
            else {
                host.on(name, fn);
            }
        });
    }

    return Abstract;
});
