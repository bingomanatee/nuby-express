var Path_Handler = require('./../../Loader/Path_Handler');

module.exports = function () {
    return new Path_Handler({
        type:'file',
        re:/((.*)_)?action\.js$/,
        target:this,
        name:'controller_action_handler',
        execute:function (match_path, callback, target, match) {
            target.add_action(match_path, callback);
        }

    });
}