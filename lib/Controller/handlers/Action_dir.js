var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var util = require('util');
var Loader = require('./../../Loader');
var Action_Dir_Action_Handler_Factory = require('./Action_dir_action');
var _DEBUG = false;

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/action(s)?$/, // any directory ending in action
        name:'controller_action_dir_handler',
        execute:function(props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            var self = this;
            if (_DEBUG) console.log('controller_action_dir_handler loading for FRAME %s, CONTEXT %s', frame.path, context.path);

            this.log(util.format('adding actions in %s to %s', match_path, util.inspect(context, true, 0)));

            var loader = new Loader();
            var action_handler = Action_Dir_Action_Handler_Factory();
            loader.add_handler(action_handler);
            loader.start_load(function(){
                context.actions = loader.actions;
                callback();
            }, match_path, frame, context);
        }
    });
}