var ondir = require('./../support/ondir');
var fs = require('fs');
var path = require('path');
var Controller = require('./../controller');
var util = require('util');
var _ = require('./../../node_modules/underscore');

function _debug(msg, param, b, c) {
    return;
    if (param) {
        msg = util.format(msg, param, b, c);
    }
    console.log('loader:: %s', msg);
}

function Loader() {

}

Loader.prototype = {

    set_404:function (framework) {
        framework.app.all('*', function (req, res) {
            if (framework.on404) {
                framework.on404(req, res);
            } else {
                res.send('<html><body>Page Not Found</p></body></html>', 404);
            }
        });

    },

    load:function (framework, callback, root_path) {

        var self = this;
        if (!root_path) {
            root_path = framework.path + '/app';
        }

        _debug(util.format('loading %s', root_path));

        function _load_controller_closure(full_path, done_cb) {
            self.load_controller(full_path, framework, done_cb);
        }

        function _no_path_closure(root_path, callback) {
            _debug('nuby loader:: No root path %s', root_path);
            callback();
        }

        ondir(root_path, callback, null, _load_controller_closure, _no_path_closure);
    },

    /** each controller eists in a dir; this handles a single controller **/

    load_controller:function (full_path, framework, done_cb) {
        var self = this;

        var controller = this._read_controller(full_path, framework);

        controller.framework = framework;
        controller.path = full_path;

        if (!controller.hasOwnProperty('name')) {
            controller.name = path.basename(full_path);
        }

        framework.controllers.push(controller);

        _debug(util.format('load_controller: controller.name = %s', controller.name));

        if (controller.hasOwnProperty('manifest')) {

            _debug('manifest: %s', util.inspect(controller.manifest));

            controller.manifest.forEach(function (manifest) {
                self.load_controller_manifest_def(controller, manifest, done_cb);
            });
        } else {
            this.load_controller_manifest(controller, 'actions', 'default', done_cb);
        }
    },

    _read_controller:function (full_path) {
        var index_file = full_path + '/index.js';

        if (path.existsSync(index_file)) {
            var controller_config = require(full_path);
        } else {
            var controller_config = {};
        }

        var controller = new Controller(controller_config);
        return controller;
    },

    load_controller_manifest_def:function (controller, manifest, callback) {
        var type = 'default';
        if (manifest.hasOwnProperty('type')) {
            type = manifest.type;
        }

        if (_.isString(manifest)) {
            _debug(util.format('load_controller_manifest_def %s (%s) for %s', manifest, type, controller.path));
            // assume it is an actions directory of default actions.
            this.load_controller_manifest(controller, manifest, type, callback);
        } else {
            _debug('load_controller_manifest_def %s (%s) for %s', manifest.path, type, controller.path);
            // it is an action directory
            this.load_controller_manifest(controller, manifest.path, type, callback, manifest.config);
        }
    },

    load_controller_manifest:function (controller, man_path, type, callback, config) {

        _debug('load_controller_manifest: path = %s, type =  %s', man_path, type);
        if (this.manifest_loaders.hasOwnProperty(type)) {
            this.manifest_loaders[type].load(controller, man_path, callback, config);
        } else {
            throw new Error('Cannot load manifest of type ' + type);
        }
    },

    manifest_loaders:{
    }

}

function _add_loader(full_path, done_cb) {
    _debug(util.format('_add_loader - loading %s', full_path));

    var loader = require(full_path);
    var type;
    if (loader.hasOwnProperty('type')) {
        type = loader.type;
    } else {
        type = path.basename(full_path);
    }

    Loader.prototype.manifest_loaders[type ] = loader;
    done_cb();
}

function _on_done_loading_loaders() {
    _debug('done loading loaders');
}

ondir(__dirname + '/loaders', _on_done_loading_loaders, null, _add_loader);

module.exports = Loader;
