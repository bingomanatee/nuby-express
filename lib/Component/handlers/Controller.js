var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var Controller = require('./../../Controller');

var _DEBUG = false;

module.exports = function () {
    return new Path_Handler({
        re:/con(troller)?_(.*)/,
        type:'dir',
        name:'com_controller',
        execute:function (props, callback) {
            var target = props.target;
            var match_path = props.full_path;
            var context = props.context;
            if (_DEBUG) console.log('PATH HANDLER >>COMPONENT<< Controller --- read %s into %s %s (%s)', match_path, target.CLASS, targetname, target.path);
            this.owner.load_controller(match_path, callback, context);
        }
    });
};