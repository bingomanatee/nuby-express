var path = require('path');
var util = require('util');

var on_dir = require('./../../../support/ondir');
var Action = require('./../../../action');
var _ = require('./../../../../node_modules/underscore');
var prop_extend = require('./../../../req_state/prop_extend');

function _debug(msg, param, a, b) {
  // return;
    if (param) {
        msg = util.format(msg, param, a, b);
    }
    console.log('DEFAULT LOADER:: %s', msg);
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
        var self = this;

        var full_path = path.resolve(controller.path, action_dir);

        _debug('loading actions from >>>>>>>>>>>>> %s', full_path);

        function _nopath_closure() {
          //  console.log('loader::default::there is no path %s', full_path);
        }

        function _load_action_closure(action_path, done_cb) {
            self._load_action(controller, action_path, done_cb);
        }

        on_dir(full_path, callback, null, _load_action_closure, _nopath_closure);

    },
    _action_path_patterns:[
        '%s/index.js',
        '%s/action.js',
        function (n) {
            return util.format('%s/%s.js', n, path.basename(n));
        }
    ],
    _get_config:function (action_path) {

        for (var i = 0; i < this._action_path_patterns.length; ++i) {
            var full_path;
            var p = this._action_path_patterns[i];
            if (_.isFunction(p)) {
                full_path = p(action_path);
            } else {
                full_path = util.format(p, action_path);
            }
            if (path.existsSync(full_path)) {
                _debug("config found at %s", full_path);
                return require(full_path);
            }
        }

        return {};

    },

    _load_action:function (controller, action_path, done_cb) {
        var config = this._get_config(action_path);

        // note - the LACK of an action file is NOT a deal killer!

        _debug('loading action %s with controller %s', action_path, controller.path);

        config.path = action_path;
        config.controller = controller;
        var framework = config.framework = controller.framework;
        var app = framework.app;

        var action = new Action(config);

        if (!action.hasOwnProperty('name')) {
            action.name = path.basename(action_path);
        }

        var view_path = action_path + '/view.html';

        if (path.existsSync(view_path)) {
            action.view_path = view_path;
        }

        function _handle_closure(req, res, next) {
            action.handle(req, res, next);
        }

        var route = action.get_route();

        _debug('loading handler for ROUTE %s (%s)', route, action.method);

        this._route_handler(controller, app, route, _handle_closure, action.method);

        controller.actions[action.name] = action;

        done_cb();
    },

    _route_handler:function (controller, app, route, handler, method) {
        var self = this;

        if (_.isArray(method)) {
            method.forEach(function (m) {
                self._route_handler(controller, app, route, handler, m);
            })
            return;
        }

        //  console.log('_route_handler: routing %s route %s ', method, route);
        switch (method) {
            case 'get':
                app.get(route, handler);
                break;

            case 'post':
                app.post(route, handler);
                break;

            case 'put':
                app.put(route, handler);
                break;

            case 'del':
                app.del(route, handler);
                break;

            case 'all':
                app.all(route, handler);

            default:
                app.all(route, handler);
        }
    }

}
