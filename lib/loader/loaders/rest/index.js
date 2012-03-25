var on_dir = require('./../../../support/ondir');
var path = require('path');
var DefaultLoader = require('./../default');
var RestGetAction = require('./../../../rest_action/get');
var RestPutAction = require('./../../../rest_action/put');
var RestPostAction = require('./../../../rest_action/post');
var _ = require('./../../../../node_modules/underscore');

var util = require('util');

function _debug(msg, param, b, c) {

    if (arguments.length > 1) {
        msg = util.format(msg, param, b, c);
    }
    console.log('REST loader:: %s', msg);
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
    load:function (controller, action_dir, callback, config) {
        var self = this;

        var full_path = path.resolve(controller.path, action_dir);

        _debug('loading actions from %s', full_path);

        function _nopath_closure() {
          //  console.log('loader::default::there is no path %s', full_path);
        }

        function _load_action_closure(action_path, done_cb) {
            _debug(' ]]] path ' + action_path);
            self._load_action(controller, action_path, done_cb);
        }

        on_dir(full_path, callback, null, _load_action_closure, _nopath_closure);

    },

    _action_path_patterns:[
        '%s/index.js',
        '%s/action.js',
        '%s/get.js',
        '%s/post.js',
        '%s/delete.js',
        '%s/put.js',
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
                return require(full_path.replace(/\.js$/,''));
            }
        }

        return {};

    },
    _load_action:function (controller, action_path, done_cb) {
        var self = this;
        var config = this._get_config(action_path);
        _debug(' >>>>>>>>>>>>>> loading action %s', action_path);

        config.path = action_path;
        config.controller = controller;
        var framework = config.framework = controller.framework;
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

            case 'delete':
                action = new RestPostAction(config);
                method = 'delete';
                break;

            default:
                _debug(' @@@@@@@@@@@@@@@@ CANNOT @@@@@@ LOAD @@@@@@@@@@@  %s of %s', action_path, controller.path);
                return;

        }

        function _handle_closure(req, res, next) {
            action.handle(req, res, next);
        }

        this._route_handler(controller, app, action.get_route(), _handle_closure, method);

        controller.actions[type] = action;

        done_cb();
    },
    _route_handler:function (controller, app, route, handler, method) {
        var self = this;

        if (_.isArray(method)) {
            console.log('ARRAY METHODS: %s', method.join(','));
            method.forEach(function (m) {
                self._route_handler(controller, app, route, handler, m);
            })
            return;
        }

        _debug('_route_handler: routing %s route %s ', method, route);
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

module.exports = RestLoader;