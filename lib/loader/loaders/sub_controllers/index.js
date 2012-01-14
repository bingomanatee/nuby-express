var Loader = require('./../../../loader');
var path = require('path');
var on_dir = require('./../../../support/ondir');

/**
 *  This loader loads all the actions in the subdirectory action_dir
 *
 * @param controller
 * @param action_dir
 * @param callback
 * @param config
 */
module.exports = {
    load:function (controller, action_dir, callback, config) {
        var self = this;

        var full_path = path.resolve(controller.path, action_dir);

        function _nopath_closure() {
        }

        function _load_sub_controllers_closure(action_path, done_cb) {
            self._load_sub_controllers(controller, action_path, done_cb);
        }

        on_dir(full_path, callback, null, _load_sub_controllers_closure, _nopath_closure);

    },

    _load_sub_controllers: function(controller, sc_path, done_cb){

        var loader = new Loader();

        loader.load(controller.framework, done_cb, sc_path);
    }

}
