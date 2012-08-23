var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var _DEBUG = false;

module.exports = function () {
    return new Path_Handler({
        re:/^action_template.js$/i,
        type:'file',
        name:'action_template',
        execute:function (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            context.action_template = require(match_path);
            if (_DEBUG) console.log('ACTION TEMPLATE >>--- read %s into %s %s (%s)', match_path, context.CLASS, context.name, context.path);
            context.load_controller(match_path, callback, frame, context);
        }
    });
};