var Path_Handler = require('./../Loader/Path_Handler');
var Resource = require('./../Resource');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var type_handler = require('./Resource_Type');
var type_dir_handler = require('./Resource_Type_Dir');

var known_types = ['action_helper', 'view_helper', 'express_helper', 'mixin', 'model', 'resource', 'static_route'];

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re: new RegExp('^(' + known_types.join('|') + ')(s)?$', 'i'),
        name:'resource_types_helper',
        execute:function (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            var match = this.re.exec(props.file);
            var type = match[1];

            var type_loader = new Loader({name: 'resource_type_loader', parent: context});
            type_loader.add_handler(type_handler(type));
            type_loader.add_handler(type_dir_handler(type));
            type_loader.start_load(callback, match_path, frame);
        }
    });
}