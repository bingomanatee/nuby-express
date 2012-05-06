var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Path_Handler = require('./../Loader/Path_Handler');
var path = require('path');
var _DEBUG = false;

function save_path(props, cb){
 //   console.log('saving %s to loader %s(%s)', props.full_path, props.loader.path, props.loader.id());
    props.loader.paths.push(props.full_path);
    cb(null, props.full_path);
}

function make_dir_handler(loader){
  return  new Path_Handler({
        name: 'dir_handler',
        type:'dir',
        can_handle:function(full_path){
          return dotty(loader, full_path);
        },
        execute: function(props, cb){
            if (!dotty(props.loader, props.full_path)){
                return cb();
            }
            save_path(props, function(){
                var fl = new File_Loader({path: props.full_path});
                fl.read_dots = props.loader.read_dots;
                function done_reading_subdir(){
                   // console.log('DONE WITH SINGLE FILE loader %s(%s); saving to loader %s', fl.id(), fl.path, props.frame.id(true));
                    props.frame.paths =  props.frame.paths.concat(fl.paths);
                    cb();
                }
                fl.start_load(done_reading_subdir, props.full_path);
            })
        }
    });
}

function dotty(loader, match_path) {
    if (loader.read_dots) {
        return true;
    } else {
        var basename = path.basename(match_path);
        var is_dot = /^\./.test(basename);
        return !is_dot;
    }
}

function make_file_handler(loader){
    return new Path_Handler({
        name: 'file_handler',
        type:'file',
        can_handle:function(full_path){
            return dotty(loader, full_path);
        },
        execute: save_path
    });
}


function File_Loader(config) {
    this.paths = [];
    Loader.call(this, config);
    this._load_file_handlers();
}

util.inherits(File_Loader, Loader);

_.extend(File_Loader.prototype, {
    can_load:function (load_path) {

         if (this.read_dots){
            return true;
        } else {
            var basename = path.basename(load_path);
            var pass = !(/^\./.test(basename));
            return pass;
        }
    },

    read_dots:true,

    _load_file_handlers:function () {

        this.add_handler(make_file_handler(this));

        this.add_handler(make_dir_handler(this));
    }

});

module.exports = File_Loader;
