var on_dir = require('./../../../support/ondir');
var path = require('path');
var Action = require('./action');
var util = require('util');

function _debug(msg, param) {
    return;
    if (param){
        msg = util.format(msg, param);
    }
    console.log('default loader:: %s', msg);
}

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

        var full_path = path.resolve(controller.path, action_dir);

        function _nopath_closure() {
            console.log('there is no path %s', full_path);
        }

        function _load_action_closure(action_path, done_cb) {
            _load_action(controller, action_path, done_cb);
        }

        on_dir(full_path, callback, null, _load_action_closure, _nopath_closure);

    }
}

function _load_action(controller, action_path, done_cb) {

    var config = require(action_path);
    _debug('loading action %s', action_path);

    config.path = action_path;
    config.controller = controller;
    var action = new Action(config);

    if (!action.hasOwnProperty('name')) {
        action.name =  path.basename(action_path);
    }

    controller.actions[action.name] = action;

    done_cb();
}