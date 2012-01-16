var path = require('path');
var on_dir = require('./../../../support/ondir');
var util = require('util');

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
        console.log('sub_controller: loading  full path %s', full_path);

        var Loader = require('./../../index');
        var loader = new Loader();

        loader.load(controller.framework, callback, full_path);
        /*
         function _nopath_closure() {
         }

         function _load_sub_controllers_closure(action_path, done_cb) {
         self._load_sub_controllers(controller, action_path, done_cb);
         }

         on_dir(full_path, callback, null, _load_sub_controllers_closure, _nopath_closure);

         },

         _load_sub_controllers:function (controller, sc_path, done_cb) {
         var Loader = require('./../../index');
         console.log('sub_controller: loading %s', sc_path);
         var loader = new Loader();

         loader.load(controller.framework, done_cb, sc_path); */
    }

}
