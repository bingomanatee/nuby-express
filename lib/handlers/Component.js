var Path_Handler = require('./../Loader/Path_Handler');
var util = require('util');
/**
 * This path handlers loads a direct subcomponent  -- as in
 * [app_path]/com_foo/
 */
module.exports = function(){
    return new Path_Handler({
        type:'dir',
        re:/^com(ponent)?_(.+)$/i,
        name: 'framework_component_handler',
        execute:function(props, callback) {

            debugger;
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            frame.load_component(match_path, callback, context);
        }
    });
};