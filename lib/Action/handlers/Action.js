var Path_Handler = require('./../../Loader/Path_Handler');
var util = require('util');
var _DEBUG = false;
/**
 * This path handlers loads a direct subcomponent  -- as in
 * [app_path]/com_foo/
 */
module.exports = function(){
    return new Path_Handler({
        type:'file',
        re:/^(.+)_action.js$/i,
        name: 'action_action_handler',
        execute:function  (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            var action = require(match_path);
          if (_DEBUG)  console.log('attempting to extend action - CONTEXT %s', context.path)
            context.extend_action(action);
            callback();
        }
    });
}