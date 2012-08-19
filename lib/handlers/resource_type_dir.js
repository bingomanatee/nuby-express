var Path_Handler = require('./../Loader/Path_Handler');
var Resource = require('./../Resource');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var _DEBUG_RES = false;

function _make_resource(res, type, name) {
    if (_DEBUG_RES)  console.log('making resource %s: %s', type, name);
    if (type && !res.type) {
        res.type = type;
    }
    if (name && !res.name) {
        res.name = name;
    }
    var r = new Resource(res);
    return r;
}

/**
 * This is a path trap for any number of directories that can contain resources.
 * resources can be grouped by known type as in
 *
 * /resources/action_helpers/my_action_helper
 *
 * or simply put in the root
 *
 * /resources/my_action_helper
 *
 * however if your action helper has the same name as a known type, it will not laod properly.
 *
 */

module.exports = function (type) {
    return new Path_Handler({
        type:'dir',
        re:new RegExp(util.format('((%s)_)?(.*)', type), 'i'),
        name:'resource_helper',
        execute:function (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            var match = this.re.exec(props.file);
            var name = match[match.length - 1];
            var new_res;
            var resource_factory = require(match_path);

            if (_.isFunction(resource_factory)) {
                if (_DEBUG_RES)   console.log('treating %s as resource_factory', match_path);
                new_res = resource_factory();
            } else if (_.isObject(resource_factory)) {
                if (_DEBUG_RES) console.log('making resource based on', res_path);
                new_res = _make_resource(resource_factory, type, name);
            } else {
                return callback();
            }

            if (type) {
                new_res.type = type;
                if (!new_res.name) {
                    name = name.replace(new RegExp('(_)?' + type + '(_)?'), '');
                    new_res.name = name;
                }
            }

            new_res._resource_path =  match_path;
            frame.add_resource(new_res);

            if (new_res.hasOwnProperty('on_add')) {
                new_res.on_add(frame, callback);
            } else {
                callback();
            }

        }
    });
}