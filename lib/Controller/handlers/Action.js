var Path_Handler = require('./../../Loader/Path_Handler');

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/((.*)_)?action$/,
        can_handle: function(full_path){
            console.log('can %s handle %s? sure!', this.name, full_path);
            return true;
        },
        name:'controller_action_handler',
        execute:function  (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            console.log('ADD ACTION ======= context %s, action %s', context.id(), match_path);
            context.add_action(match_path, callback, frame);
        }
    });
}