var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var Controller = require('./../../Controller');

var _DEBUG = false;

module.exports = function () {
    return new Path_Handler({
        re:/^(con_)?(.*)/,
        type:'dir',
        name:'cd_controller_direct',
        execute:function (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;
            context.load_controller(match_path, callback, frame, context);
        }
    });
};