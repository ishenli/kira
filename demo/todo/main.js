/**
 * @file file
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var config = require('./config');
    var controller = require('kira/controller');

    controller.registerAction(config);
    controller.setMainContainer(document.getElementById('main'));

    return {
        init:function() {

        }
    };
});