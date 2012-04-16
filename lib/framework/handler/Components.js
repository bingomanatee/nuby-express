var Path_Handler = require('./../../Loader/Path_Handler');
var Gate = require('node-support/gate')
var fs = require('fs');
var Component = require('./../../Component');

var _DEBUG = false;

/**
 * This path handler loades a DIRECTORY of compoennt directories  -- as in
 * [app_path]/coms/com_foo/
 * [app_path]/components/com_bar/
 */
module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^com(ponent)(s)$/i,
        name:'framework_components_handler',
        execute:function (match_path, callback, target, match) {
            var self = this;
            if (_DEBUG) console.log('PATH_HANDLER Framework Components read: %s', match_path);
            var gate = new Gate(callback);

            fs.readdir(match_path, function (err, files) {
                if (err) {
                    console.log('error reading %s in components loader', match_path);
                    throw err;
                }
                files.forEach(function (name) {
                    var com_path = match_path + '/' + name;

                    target.load_component(com_path, gate.task_done_callback(true));
                });
                gate.start();
            });

        }
    });
}
