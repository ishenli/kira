/**
 * @file events 事件中心
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var Emitter = require('winnie/lib/emitter');

    var exports = {};

    exports.notifyError = function (events) {
        this.fire('error', events);
    };

    Emitter.mixTo(exports);

    return exports;

});
