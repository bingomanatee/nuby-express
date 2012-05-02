var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var controller_handler = require('./Controller');
var _DEBUG = false;
var util = require('util');
var Loader = require('./../../Loader');

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^con(troller)?(s)?$/i,
        name:'component_controller_dir',
        execute:function (props, callback) {

          if (_DEBUG)  console.log('controller-dir props: %s', util.inspect(props))
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;

            if (_DEBUG) console.log('PATH HANDLER Controller_Dir --- read %s', match_path);
            var component_loader = new Loader();
            component_loader.add_handler(controller_handler());
            component_loader.start_load(callback, match_path, frame, context);
        }
    });
}