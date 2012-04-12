var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Path_Handler = require('./../Loader/Path_Handler');
var path = require('path');

function File_Loader(config) {
    this.paths = [];
    _.extend(this, config);
    this._load_file_handlers();
}

util.inherits(File_Loader, Loader);

_.extend(File_Loader.prototype, {
    can_load:function (load_path) {
        if (! path.existsSync(load_path)){
            return false;
        }

        if (!this.hasOwnProperty('read_dots')){
            return true;
        } else if (this.read_dots){
            return true;
        } else {
            var basename = path.basename(load_path);
            var pass = !(/^\./.test(basename));
            return pass;
        }
    },

    read_dots:true,

    _load_file_handlers:function () {
        var self = this;

        function dotty(match_path) {
            if (self.read_dots) {
                return true;
            } else {
                var basename = path.basename(match_path);
                var is_dot = /^\./.test(basename);
                return !is_dot;
            }
        }

        function save_path(match_path, cb){
            self.paths.push(match_path);
            cb(null, match_path);
        }

        var file_handler = new Path_Handler({
            target:self,
            type:'file',
            can_handle:dotty,
            execute: save_path
        });

        this.add_handler(file_handler);

        var dir_handler = new Path_Handler({
            target:self,
            type:'dir',
            can_handle:dotty,
            execute: save_path
        });

        this.add_handler(dir_handler);
    },

    _load_dir_policy:'load and iterate',

    done_delay:1500 // milliseconds until done is emitted;

});

module.exports = File_Loader;
