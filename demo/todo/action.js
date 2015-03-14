/**
 * @file todoModel
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var locator = require('./kira/locator');

    var config = {};

    config.view = require('./view');
    config.model = require('./model');

    config.events = {
        'view:add': function (name) {
            var me = this;
            this.model.create(name).then(function (data) {
                console.log(data);
                me.view.updateView(data);
            });

        },
        'view:remove': function (id) {
            var me = this;
            this.model.remove(id).then(function (data) {
                me.view.updateView(data);
            });
        },
        'view:update': function (newName) {
            var me = this;
            this.model.update(newName).then(function(value) {
                console.log(value);
                locator.redirect('#/');
            },function(error) {
                console.log(error);
            });
        }
    };

    return config;
});
