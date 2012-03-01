var path = require('path');
var util = require('util');

var on_dir = require('./../../../support/ondir');
var Action = require('./../../../action');
var _ = require('./../../../../node_modules/underscore');
var file_finder = require('./../../../file_finder');

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
        function (n, b) {
            return util.format('%s/%s.js', n, b);
        },
        function(n, b){
            return util.format('%s/%s_action.js', n, b);
        }
    ],
    _get_config:function (action_path) {
        return file_finder(action_path, this._action_path_patterns, true, null, true);
    },

    _view_path_options: [
        '%s/view.html',
        function (root, base){
            return util.format('%s/%s_view.html', root, base);
        }
    ],

    _load_action:function (controller, action_path, done_cb) {
        var config = this._get_config(action_path);
        if (!config){
            _debug('cannot find action file for %s', action_path);
            config = {};
        } else {
            _debug('action path: ------>>> %s',  file_finder(action_path, this._action_path_patterns));
        }

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

        action.view_path = file_finder(action_path, this._view_path_options);

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
