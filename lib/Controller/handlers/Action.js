var Path_Handler = require('./../../Loader/Path_Handler');
var util = require('util');
var path = require('path');
var _DEBUG = false;

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^action_(.*)$/,
        name:'controller_action_handler',

        execute:function  (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            if (_DEBUG) console.log('%s(%s) loading action %s', context.name, context.path, match_path);
            context.add_action(match_path, callback, frame, context);
        }
    });
}