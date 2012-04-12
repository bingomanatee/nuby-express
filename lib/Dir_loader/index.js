var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var path = require('path');

function Dir_loader(config) {
    this.paths = [];
    _.extend(this, config);
    var self = this;
    this.on('add_file', function (file_path) {
        self.add_file(file_path);
    });
}

util.inherits(Dir_loader, Loader);

_.extend(Dir_loader.prototype, {
    can_load:function (load_path) {
        if ( path.existsSync(load_path)){
            var stat = fs.statSync(load_path);
            return stat.isDirectory();
        } else {
            return false;
        }
    },

    load_item:function (load_path) {
        var self = this;
        fs.stat(load_path, function (err, stat) {
            if (stat.isDirectory()) {
                self.emit('work_started');
                self.emit('add_file', load_path);
                self.load(load_path);
            } else {
                self.emit('add_file', load_path);
            }
        });
    },

    add_file:function (file_path) {
        this.paths.push(file_path);
        this.emit('work_done');
    }

});

module.exports = Dir_loader;
