var Path_Handler = require('./../Loader/Path_Handler');
var Resource = require('./../Resource');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var _DEBUG = false;
var add_static_route = require('./../utility/add_static_route');

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
        re: /^public/i,
        name:'public_static_files',
        execute:function (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            var match = this.re.exec(props.file);
            var name = match[match.length - 1];

            callback();

        }
    });
}