var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var util = require('util');

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        target:this,
        re:/action(s)?$/, // any directory ending in action
        name:'controller_action_dir_handler',
        execute:function (match_path, callback, target, match) {
            var self = this;
            fs.readdir(match_path, function (err, actions) {
                actions.forEach(function (action) {
                    target.emit('work_started', util.format('started action load: %s/%s', match_path, action));
                    target.add_action(match_path + '/' + action, target.work_done_callback());
                })
            });
            callback(null, true);
        }
    });
}