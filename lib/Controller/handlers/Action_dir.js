var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var util = require('util');
var Loader = require('./../../Loader');
var action_handler = require('./Action');

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
            console.log('adding actions in %s to %s', match_path, util.inspect(context, true, 0));

            var loader = new Loader();
            loader.add_handler(action_handler());
            loader.start_load(function(){
                context.actions = loader.actions;
                callback();
            }, match_path, frame, context);
        }
    });
}