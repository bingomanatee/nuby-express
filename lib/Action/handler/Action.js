var Path_Handler = require('./../../Loader/Path_Handler');
var util = require('util');
/**
 * This path handler loads a direct subcomponent  -- as in
 * [app_path]/com_foo/
 */
module.exports = function(){
    return new Path_Handler({
        type:'file',
        re:/^(.+)_action.js$/i,
        name: 'action_action_handler',
        execute:function (match_path, callback, target, match) {
          //  console.log('Extending with %s', match_path);
            var action = require(match_path);
            this.owner.extend(action);
            callback();
        }
    });
}