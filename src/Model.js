/**
 * @file Model
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var Abstract = require('./Abstract');
    var Promise = require('winnie/lib/promise');

    var Model = Abstract.extend({

        /**
         * 初始化执行方法
         * @param {Object=} option 配置
         */
        initialize: function (option) {
            Model.superClass.initialize.call(this, option);

            // 用于存放model临时数据的对象
            this.store = {};
        },

        /**
         * 获取数据
         * @param {string} query 查询条件
         * @return {Promise} promise对象
         */
        fetch: function (query) {
            return Promise.resolve(query);
        },
        /**
         * 获取某个值
         * @param {string} name 属性名
         * @return {*}
         */
        get: function (name) {
            return this.store[name];
        },
        /**
         * 设置值
         *
         * @param {string} name 属性名
         * @param {*} value 对应的值
         * @return {*} value 返回`value`对象
         * @param {Object} [options] 相关选项
         * @param {boolean} [options.silent=false] 如果该值为`true`则不触发change事件
         * @fires change
         */
        set: function (name, value, options) {
            var record = setProperty(this, name, value);

            options = options || {};
            if (record && !options.silent) {
                this.fire('change', {
                    changes: [record]
                });
            }
            return value;
        },
        /**
         * 删除对应键的值
         *
         * @param {string} name 属性名
         * @return {Object|string} 在删除前`name`对应的值
         * @param {Object} [options] 相关选项
         * @fires change
         */
        remove: function (name, options) {
            if (!this.store.hasOwnProperty(name)) {
                return;
            }
            options = options || {};
            var value = this.store[name];
            delete this.store[name];

            if (!options.silent) {
                var event = {
                    changes: [
                        {
                            type: 'remove',
                            name: name,
                            oldValue: value,
                            newValue: undefined
                        }
                    ]
                };

                this.fire('change', event);
            }

            return value;
        },

        /**
         * 批量设置数据
         * @param {Object} data 数据对象
         * @param {Object} [options] 相关选项
         * @param {boolean} [options.silent=false] 如果该值为`true`则不触发change事件
         * @fires change
         * @return {Object} data 数据对象`
         */
        fill: function (data, options) {
            options = options || {};

            var changes = [];
            for (var name in data) {
                if (data.hasOwnProperty(name)) {
                    var record = setProperty(this, name, data[name]);
                    if (record) {
                        changes.push(record);
                    }
                }
            }

            if (changes.length && !options.silent) {
                this.fire('change', {
                    changes: changes
                });
            }

            return data;
        },
        dispose: function () {
            Model.superClass.dispose.call(this);
        }
    });

    /**
     * 设置单个属性值
     * @param {Model} model 作为容器的Model对象
     * @param {string} name 属性名
     * @param {Object|string} value 对应的值
     * @return {null|Object} 一个变化记录项
     * @ignore
     */
    function setProperty(model, name, value) {
        // 判断是修改还是增加
        var type = model.store.hasOwnProperty(name) ? 'change' : 'add';

        var oldValue = model.store[name];
        model.store[name] = value;

        if (oldValue !== value) {
            return {
                type: type,
                oldValue: oldValue,
                newValue: value,
                name: name
            };
        }
        return null;
    }

    return Model;
});
