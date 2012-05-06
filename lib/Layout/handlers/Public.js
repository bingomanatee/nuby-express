var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var Gate = require('support/gate');

var _DEBUG = false;

module.exports = function (layout) {
    return new Path_Handler({
        type:'dir',
        re:/^public$/i,
        name:'layout_public',
        execute:function (props, callback) {
            var prefix;
            if (layout.config.static_prefix) {
                prefix = layout.config.static_prefix;
            } else {
                prefix = '';
            }
            var root = props.full_path.substr(props.frame.path.length);
            // the static path is added as a seperate resource to the frame
            props.frame.add_resource({
                type:'static_route',
                name: 'layout_' + layout.name + '_static_route',
                prefix:prefix,
                root:root});
            callback();
        }
    });
};