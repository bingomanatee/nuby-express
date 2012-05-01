var Path_Handler = require('./../../Loader/Path_Handler');
var fs = require('fs');
var controller_handler = require('./Controller');
var _DEBUG = false;

module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^con(troller)?(s)?$/i,
        name:'component_controller_dir',
        execute:function (props, callback) {
            var target = props.target;
            var match_path = props.full_path;
            var context = props.context;
            
            if (_DEBUG) console.log('PATH HANDLER Controller_Dir --- read %s', match_path);
            var component_loader = new Loader();
            component_loader.add_hander(controller_handler());
            component_loader.start_load(callback, match_path, target, context);
        }
    });
}