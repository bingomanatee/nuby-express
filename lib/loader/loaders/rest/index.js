var on_dir = require('./../../../support/ondir');
var path = require('path');
var DefaultLoader = require('./../default');
var RestGetAction = require('./../../../rest_action/get');
var RestPutAction = require('./../../../rest_action/put');
var RestPostAction = require('./../../../rest_action/post');
var _ = require('./../../../../node_modules/underscore');

var util = require('util');

function _debug(msg, param, b, c) {
    return;
    if (arguments.length > 1) {
        msg = util.format(msg, param, b, c);
    }
    console.log('default loader:: %s', msg);
}

/**
 *  This loader loads REST actions in the rest directory.
 *
 * @param controller
 * @param action_dir
 * @param callback
 * @param config
 */

var RestLoader = {

    _load_action:function (controller, action_path, done_cb) {
        var self = this;
        var config = require(action_path);
        _debug('rest loader::loading action %s', action_path);

        config.path = action_path;
        config.controller = controller;
        var framework = controller.framework;
        var app = framework.app;

        var type;
        if (config.hasOwnProperty('type')) {
            type = config.type;
        } else {
            type = path.basename(action_path).toLowerCase();
        }

        var action = null;
        var method;

        switch (type) {
            case 'get':
                action = new RestGetAction(config);
                method = 'get';
                break;

            case 'put':
                action = new RestPutAction(config);
                method = 'put';
                break;

            case 'post':
                action = new RestPostAction(config);
                method = 'post';
                break;

            default:
                _debug('cannot load rest action %s of %s', action_path, controller.path);
                return;

        }

        function _handle_closure(req, res, next) {
            action.handle(req, res, next);
        }

        this._route_handler(controller, app, action.get_route(), _handle_closure, method);

        controller.actions[type] = action;

        done_cb();
    }
}
    ;

_.defaults(RestLoader, DefaultLoader);
module.exports = RestLoader;