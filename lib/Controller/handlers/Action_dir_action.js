var Path_Handler = require('./../../Loader/Path_Handler');
var _DEBUG = false;


module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/.*/,
        can_handle:function (full_path) {
            return true;
        },
        name:'controller_action_dir_action_handler',
        execute:function (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            if (_DEBUG)  console.log('adding action to CONTEXT %s', context.path);
            context.add_action(match_path, callback, frame);
        }
    });
}