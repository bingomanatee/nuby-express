var Path_Handler = require('./../../Loader/Path_Handler');

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/((.*)_)?action$/,
        name:'controller_action_handler',
        execute:function (match_path, callback, target, match) {
            this.owner.add_action(match_path, callback, target);
        }

    });
}