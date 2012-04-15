var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');

var _DEBUG = false;

module.exports = new Path_Handler({
    type:'dir',
    re:/^con(troller)?(s)?$/i,
    name: 'component_controller_dir',
    execute:function (match_path, callback, target) {
        if (_DEBUG) console.log('PATH HANDLER Controller_Dir --- read %s', match_path);
        var self = this;
        fs.readdir(match_path, function (err, files) {

            if (err) {
                return callback(err);
            }

            //@TODO: follow up callback - or lack thereof ...
            target.load(files, match_path, target);
            callback(null, true);
        });
    }
});