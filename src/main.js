/**
 * @file kira main
 * @author ishenli <meshenli@gmail.com>
 */

define(function (require) {

    var exports = {
        start: function () {
            require('./controller').start();
            require('./router').start();
            require('./locator').start();
        }
    };

    return exports;

});
