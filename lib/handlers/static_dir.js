var Path_Handler = require('./../Loader/Path_Handler');
var Resource = require('./../Resource');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var _DEBUG = false;
var add_static_route = require('./../utility/add_static_route');
var proper_path = require('support/proper_path');
var Static_Config_Factory = require('./Static_Config');
/**
 *
 * This attaches static resources to the framework path
 * for any static folder.
 *
 */

module.exports = function (type) {
    return new Path_Handler({
        type:'dir',
        re:/^static/i,
        name:'static_dir',
        execute:function (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            var match = this.re.exec(props.file);
            var name = match[match.length - 1];

            function _relative_path(dir_path) {
                var l = frame.path.length;
                return dir_path.substr(l);
            }

            var static_dir_loader = new Loader();
            var static_config_handler = Static_Config_Factory();
            static_dir_loader.add_handler(static_config_handler);

            if (_DEBUG) console.log('STATIC DIR loading for fraome %s', frame.path);

            static_dir_loader.start_load(
                function () {
                    if (!static_dir_loader.config) throw new Error(util.format('no config for %s', match_path));
                    if (!static_dir_loader.config.map) throw new Error(util.format('no map for %s', match_path));
                    var map = static_dir_loader.config.map;
                   if (_DEBUG) console.log('map: %s', util.inspect(map));
                    _.each(map, function(url, prefix){
                       var full_path = match_path + proper_path(prefix);
                        var root = _relative_path(full_path);
                        add_static_route(root, 'static_path_for_' + root, url, frame)
                    })
                    callback();
                }, match_path, frame
            );
        }
    });
}
/*

function _load_static(static_def, context, frame, callback) {

    static_def.forEach(function (def) {
        if (!/^(\/)?static/.test(def.path)) {
            def.path = '/static' + proper_path(def.path);
        }
        var static_path = _relative_path(context, frame) + proper_path(def.path, true);
        var prefix = def.prefix;
        add_static_route(static_path, context.name + '_static', prefix, frame);
    });

    callback();
}*/
