/**
 * @file todoModel
 * @author shenli <meshenli@gmail.com>
 */

define(function (require) {
    var Promise = require('winnie/lib/promise');
    var Storage = require('saber-storage');
    var TODO_TABLE = 'todo-table';

    var storage = new Storage({
        storageId: '_kira',    // optional
        memoryCache: false     // optional
    });

    var config = {};

    config.create = function (name) {
        var todoTable = getTable();

        var id = +new Date();

        var record = {
            id: id,
            name: name
        };

        todoTable.push(record);

        setTable(todoTable);

        return Promise.resolve(todoTable);


    };

    config.remove = function (id) {
        var table = getTable();
        id = parseInt(id, 10);

        each(table, function (item, i) {
            if (id === item.id) {
                table.splice(i, 1);
                return false;
            }
        });

        setTable(table);

        return Promise.resolve(table);

    };

    config.find = function (id) {
        id = parseInt(id, 10);

        var list = this.get('table') || getTable();
        var me = this;

        return new Promise(function (resolve, reject) {
            var res;

            each(list, function (todo) {
                if (todo.id === id) {
                    me.set('id', id);
                    resolve({
                        todo: todo,
                        isEdit: true
                    });
                    res = true;
                    return false;
                }
            });

            !res && reject('can not find');
        });

    };

    config.fetch = function (query) {

        if (query && query.id) {
            return this.find(query.id);
        }

        var table = getTable();

        this.set('table', table);

        return Promise.resolve({
            table: table
        });

    };

    config.update = function (newName) {
        var table = getTable();
        var id = this.get('id');


        return new Promise(function (resolve, reject) {

            var res;

            each(table, function (item, index) {
                if (item.id === id) {
                    item.name = newName;
                    table[index] = item;
                    setTable(table);
                    resolve('success');
                    res = true;
                    return false;
                }
            });

            !res && reject('error');
        });


    };

    function getTable() {
        return storage.getItem(TODO_TABLE) || [];
    }

    function setTable(table) {
        storage.setItem(TODO_TABLE, table);
    }

    function each(source, fn) {
        for (var i = 0, len = source.length; i < len; i++) {
            if (fn(source[i], i) === false) {
                break;
            }
        }
    }

    return config;
});
