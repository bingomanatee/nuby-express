var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var util = require('util');

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/action(s)?$/, // any directory ending in action
        name:'controller_action_dir_handler',
        execute:function (match_path, callback, target, match) {
            var self = this;
            var wdc = target.start_and_wdc('loading actions in %s', match_path);
            fs.readdir(match_path, function (err, actions) {
                actions.forEach(function (action) {
                    var awdc = target.start_and_wdc('started action load: %s/%s', match_path, action);
                    self.owner.add_action(match_path + '/' + action, awdc);
                })
                wdc();
                callback(null, true);
            });
        }
    });
}