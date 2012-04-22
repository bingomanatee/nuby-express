var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var Gate = require('support/gate');

var _DEBUG = false;

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^con(troller)?(s)?$/i,
        name:'component_controller_dir',
        execute:function (match_path, callback, target) {
            if (_DEBUG) console.log('PATH HANDLER Controller_Dir --- read %s', match_path);
            var self = this;
            fs.readdir(match_path, function (err, files) {

                if (err) {
                    return callback(err);
                }
                var gate = new Gate(callback);
                files.forEach(function (file) {
                    self.owner.load_controller(match_path + '/' + file, gate.task_done_callback(true));
                });
                gate.start();
            });
        }
    });
}