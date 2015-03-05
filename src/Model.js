/**
 * @file Model
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var Abstract = require('./Abstract');
    var Promise = require('winnie/lib/promise');

    var Model = Abstract.extend({
        /**
         * 获取数据
         * @param {string} query 查询条件
         * @return {Promise} promise对象
         */
        fetch: function (query) {
            return Promise.resolve(query);
        }
    });

    return Model;
});