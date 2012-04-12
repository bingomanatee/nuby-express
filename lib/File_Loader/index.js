var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var path = require('path');

function File_Loader(config) {
    this.paths = [];
    _.extend(this, config);
    var self = this;
}

util.inherits(File_Loader, Loader);

_.extend(File_Loader.prototype, {
    can_load:function (load_path) {
        return path.existsSync(load_path);
    },

    load_file: function(file){
        console.log('adding file to paths: %s', file);
        this.paths.push(file);
        this.emit('work_done', file);
    },

    load_dir: function(file){
        console.log('adding dir to paths: %s', file);
        this.paths.push(file);
        this.emit('work_done', file);
    },

    _load_dir_policy: 'load and iterate',

    done_delay: 1500 // milliseconds until done is emitted;

});

module.exports = File_Loader;
