var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var cd_controller = require('./Controller_dir_controller');
var _DEBUG = false;
var util = require('util');
var Loader = require('./../../Loader');
var action_template = require('./Action_Template');

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
            var controller_loader = new Loader();
            controller_loader.add_handler(cd_controller());

            controller_loader.add_handler(action_template());

            controller_loader.start_load(function(){
                context.controllers = context._controllers.concat(controller_loader.controllers);
                callback();
            }, match_path, frame, context);
        }
    });
}