var Path_Handler = require('./../../Loader/Path_Handler');
var util = require('util');
var path = require('path');

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^action_(.*)$/,
        name:'controller_action_handler',

        execute:function  (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            console.log('%s loading action %s', this.name, match_path);
            context.add_action(match_path, callback, frame);
        }
    });
}