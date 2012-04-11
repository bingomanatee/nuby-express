var path = require('path');
//var on_dir = require('./../../../support/ondir');
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
        console.log('********* SUB CONTROLLER: loading  full path %s', full_path);

        var Loader = require('../../index.js');
        var loader = new Loader();

        loader.load(controller.framework, callback, full_path);
    }

}
