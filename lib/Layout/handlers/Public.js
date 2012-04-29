var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var Gate = require('support/gate');

var _DEBUG = false;

module.exports = function (layout) {
    return new Path_Handler({
        type:'dir',
        re:/^public$/i,
        name:'layout_public',
        execute:function (match_path, callback, target) {
            var prefix;
            if (layout.configs.static_prefix) {
                prefix = layout.configs.static_prefix;
            } else {
                prefix = '';
            }
            var root = match_path.substr(target.path.length);
            target.add_resource({
                type:'static_route',
                name: 'layout_' + layout.name + '_static_route',
                prefix:prefix,
                root:root});
        }
    });
};