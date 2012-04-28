var Path_Handler = require('./../Loader/Path_Handler');
var Resource = require('./../Resource');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Gate = require('support/gate');
var _ = require('underscore');
var Loader = require('./../Loader');
var type_handler = require('./resource_type');
var type_dir_handler = require('./resource_type_dir');

var known_types = ['action_helper', 'view_helper', 'express_helper', 'mixin', 'model', 'resource'];

function _make_resource(res, type, name) {
    //  console.log('making resource %s: %s', type, name);
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

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^(action_helper|view_helper|express_helper|mixin|model|resource)(s)?$/i,
        name:'resource_types_helper',
        execute:function (match_path, callback, target, match) {
            var type = match[1];
            console.log('loading resource %s, type %s', match_path, type);

            var type_loader = new Loader();
            type_loader.add_handler(type_handler(type));
            type_loader.add_handler(type_dir_handler(type));
            type_loader.start_load(callback, match_path, target);

        }
    });
}