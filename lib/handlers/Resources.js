var Path_Handler = require('./../Loader/Path_Handler');
var Resource = require('./../Resource');
var util = require('util');
var path = require('path');
var fs = require('fs');
var Gate = require('support/gate');
var _ = require('underscore');
var resource_type_handler = require('./Resource_Types');
var Loader = require('./../Loader');

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
        re:/^resource(s)?$/i,
        name:'resources_handler',
        execute:function (match_path, callback, target, match) {
       //     console.log('Resources loader: loading %s', match_path);
            var component_loader = new Loader();
            component_loader.add_handler(resource_type_handler());
            component_loader.start_load(callback, match_path, target);


        }
    });
}