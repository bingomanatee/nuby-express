var Path_Handler = require('./../../Loader/Path_Handler');
var Gate = require('support/gate')
var fs = require('fs');
var Component = require('./../../Component');
var Loader = require('./../../Loader');
var component_handler = require('./Component');
var _DEBUG = false;

/**
 * This path handlers loades a DIRECTORY of compoennt directories  -- as in
 * [app_path]/coms/com_foo/
 * [app_path]/components/com_bar/
 */


module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^com(ponent)?(s)?$/i,
        name:'framework_components_handler',
        execute:function (match_path, callback, target, match) {

            var component_loader = new Loader();
            component_loader.add_hander(component_handler());
            component_loader.start_load(callback, match_path, target);
        }
    });
}