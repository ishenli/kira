/**
 * @file todoModel
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {

    var lib = require('winnie');

    var config = {};

    config.templateMainTarget = 'main';
    config.template = document.getElementById('template').innerHTML;

    config.events = {
        beforeRender: function () {
            this.template.addFilter('add',function(source, plus) {
                return parseInt(source, 10) + plus;
            })
        }
    };
    config.domEvents = {
        'click:#btn-add': function () {
            var name = lib.get('#name').value;
            this.fire('add', name);
        },
        'click:.remove': function(e) {
            var el = e.currentTarget;
            var id = el.getAttribute('data-id');
            this.emit('remove',id);
        },
        'click:#btn-update': function(e) {
            var newName = lib.get('#name').value;
            this.emit('update',newName);

        }
    };

    config.updateView = function(data) {
        var render = this.template.getRenderer('list');
        var html = render({
            table: data
        });
        lib.get('#list').innerHTML = html;
    };

    return config;
});
