var Path_Handler = require('./../Loader/Path_Handler');
var fs = require('fs');
var layout_handler = require('./Layout');

var _DEBUG = false;

/**
 * This path handlers loades a DIRECTORY of compoennt directories  -- as in
 * [app_path]/coms/com_foo/
 * [app_path]/layouts/com_bar/
 */
module.exports = function () {
    return new Path_Handler({
        type:'dir',
        re:/^layout(s)?$/i,
        name:'layout_handler',
        execute:function (props, callback) {
            var frame = props.frame;
            var match_path = props.full_path;
            var context = props.context;

            var layout_loader = new Loader();
            layout_loader.add_handler(layout_handler());
            layout_loader.start_load(callback, match_path, frame, context);
        }
    });
}

