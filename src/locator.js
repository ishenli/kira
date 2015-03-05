/**
 * @file locator 用来分析的hash的模块
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var Emitter = require('winnie/lib/emitter');

    var locator = {};
    var currentLocation = '';

    Emitter.mixTo(locator);


    /**
     * 获取地址栏hash的值
     * @return {string} url hash值
     */
    function getLocation() {
        var index = location.href.indexOf('#');
        return index === -1 ? '' : location.href.slice(index);
    }

    /**
     * 更新当前的`hash`值，同时在历史记录中添加该项
     *
     * 如果hash值与当前的地址相同则不会进行更新
     *
     * 注意该函数不会触发`redirect`事件，需要跳转请使用`forward`方法，
     * @param {string} url 需要进行更新的hash值
     * @param {Object} options 配置项
     * @return {boolean} 如果地址有过变更则返回true
     * @ignore
     */
    function updateURL(url, options) {
        var changed = currentLocation !== url;

        if (changed && getLocation() !== url) {
            location.hash = url;
        }

        currentLocation = url;
        return changed;
    }

    function forwardHash() {
        var url = getLocation();
        locator.redirect(url);
    }

    var rollTimer = 0;
    var startupTimer = 1;

    /**
     * 开始监听hash变化
     * @param {boolean} first 是否处理初次进入的hash
     */
    function start(first) {
        if (window.addEventListener) {
            window.addEventListener('hashchange', forwardHash, false);
        }
        else if ('onhashchange' in window && document.documentMode > 7) {
            window.attachEvent('onhashchange', forwardHash);
        }
        else {
            rollTimer = setInterval(forwardHash, 100);
        }

        if (first) {
            startupTimer = setTimeout(forwardHash, 0);
        }
    }

    /**
     * 开始启动监听hash的变化
     */
    locator.start = function () {
        start(true);
    };

    /**
     * 根据输入的URL，进行处理后获取真实应该跳转的URL地址
     * @param {string} url url地址
     * @return {string} url 处理之后的url
     */
    locator.resolveURL = function (url) {
        // 当类型为URL时，使用`toString`可转为正常的url字符串
        url = url + '';

        // 如果直接获取`location.hash`，则会有开始处的**#**符号需要去除
        if (url.indexOf('#') === 0) {
            url = url.slice(1);
        }

        // url未指定，则从配置中拿
        if (!url || url === '/') {
            url = require('./config').indexURL;
        }

        return url;
    };

    /**
     * 执行重定向逻辑
     * @param {string} url 访问的url
     * @param {Object} options 配置项
     * @return {boolean} isLocationChanged hash是否变化
     */
    locator.redirect = function (url, options) {
        options = options || {};
        url = locator.resolveURL(url);

        var referrer = currentLocation;

        // 首先先判断url是否变化
        var isLocationChanged = updateURL(url, options);

        if (isLocationChanged) {
            locator.fire('redirect', {
                url: url,
                referrer: referrer
            });

            require('./events').fire('redirect', {
                url: url,
                referrer: referrer
            });
        }

        return isLocationChanged;

    };




    return locator;
});
