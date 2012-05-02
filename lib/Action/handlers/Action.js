var Path_Handler = require('./../../Loader/Path_Handler');
var util = require('util');
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
            console.log('Extending with %s', match_path);
            var action = require(match_path);
            context.extend(action);
            callback();
        }
    });
}