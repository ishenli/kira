/**
 * @file URL 用来对url进行处理
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var util = require('winnie/lib/util');

    var QUERY_SPLIT = '~';

    /**
     * URL
     * URL实例:#/action~uid=100&name=shenli
     * @param {string} path url路径
     * @param {string} search url搜索
     * @param {string} searchSeparator url搜索query分隔符
     * @constructor
     */
    function URL(path, search, searchSeparator) {
        path = path || '/';
        search = search || '';
        searchSeparator = searchSeparator || QUERY_SPLIT;

        this.getURL = function () {
            return search ? (path + searchSeparator + search) : path;
        };

        this.getPath = function () {
            return path;
        };

        /**
         * @method getSearch
         *
         * 获取search部分
         *
         * @return {string} URL中的search部分
         */
        this.getSearch = function () {
            return search;
        };

        var query = null;

        /**
         * @method getQuery
         *
         * 获取参数对象或指定参数的值
         *
         * @param {string} [key] 指定参数的名称，不传该参数则返回整个参数对象
         * @return {string | Object} 如果有`key`参数则返回对应值，
         * 否则返回参数对象的副本
         */
        this.getQuery = function (key) {
            if (!query) {
                query = URL.parseQuery(search);
            }
            return key ? query[key] : util.extend({}, query);
        };

    }

    /**
     * 解析完整的URL
     *
     * 该函数仅解析`path`、`search`和`query`
     * URL:#/action~uid=100&name=shenli
     * @param {string} url 完整的URL
     * @param {Object} [options] 控制解析行为的相关参数
     * @param {string} [options.querySeparator="~"] 用于分隔path和search的字符
     * @return {URL} 一个URL对象
     * @static
     */
    URL.parse = function (url, options) {
        options = util.extend({
            querySeparator: QUERY_SPLIT
        }, options);

        var index = url.indexOf(options.querySeparator);

        // 有查询条件，
        if (index >= 0) {
            return new URL(
                url.slice(0, index),
                url.slice(index + 1), // 不包含querySeparator
                options.querySeparator
            );
        }
        else {
            return new URL(url, '', options.querySeparator);
        }

    };

    /**
     * 根据`query`规则解析字符串并返回参数对象
     * eg:name=shenli&age=18&sex=boy
     * @param {string} search 搜索条件
     */
    URL.parseQuery = function (search) {
        var groups = search.split('&');
        var item;
        var query = {};
        var index;

        for (var i = 0; i < groups.length; i++) {
            item = groups[i];
            if (!item) {
                continue;
            }

            index = item.indexOf('=');

            var key = index < 0
                ? decodeURIComponent(item)
                : decodeURIComponent(item.slice(0, index));

            var value = index < 0
                ? true
                : decodeURIComponent(item.slice(index + 1));

            // 已经存在这个参数，且新的值不为空时，把原来的值变成数组
            if (query.hasOwnProperty(key)) {
                if (query[key] !== true) {
                    query[key] = [].concat(query[key], value);
                }
            }
            else {
                query[key] = value;
            }

            return query;
        }

    };

    return URL;
});
