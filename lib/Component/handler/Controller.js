var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var Controller = require('./../../Controller');

var _DEBUG = false;

module.exports = new Path_Handler({
    re:/con(troller)?_(.*)/,
    type:'dir',
    name: 'com_controller',
    execute:function (match_path, callback, target, match) {
        if (_DEBUG) console.log('PATH HANDLER >>COMPONENT<< Controller --- read %s into %s %s (%s)',
            match_path, target.CLASS, target.name(), target.path);
        var name = match ? match[match.length - 1] : '';
        var con = new Controller({path:match_path});
        con.start_load(callback, match_path);
        target.controllers.push(con);
        //  callback(null, true);
    }
});