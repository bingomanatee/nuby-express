var ondir = require('./../support/ondir');
var fs = require('fs');
var path = require('path');
var Controller = require('./../controller');
var util = require('util');

function _debug(msg, param) {
    return;
    if (param){
        msg = util.format(msg, param);
    }
    console.log('loader:: %s', msg);
}

function Loader() {

}

Loader.prototype = {

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
            console.log('nuby loader:: No root path %s', root_path);
            callback();
        }

        ondir(root_path, callback, null, _load_controller_closure, _no_path_closure);
    },

    /** each controller eists in a dir; this handles a single controller **/

    load_controller:function (full_path, framework, done_cb) {
        _debug('load_controller cb: %s', done_cb.toString());
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
            function _controller_manifest_closure(manifest) {
                self.load_controller_manifest_def(controller, manifest, done_cb);
            }

            controller.manifest.forEach(_controller_manifest_closure);
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
        if (_.isString(manifest)) {
            // assume it is an actions directory of default actions.
            this.load_controller_manifest(controller, manifest, 'default');
        } else { // it is an action directory
            this.load_controller_manifest(controller, manifest.path, manifest.type, callback, manifest.config);
        }
    },

    load_controller_manifest:function (controller, man_path, type, callback, config) {
        if (this.manifest_loaders.hasOwnProperty(type)) {
            this.manifest_loaders[type].load(controller, man_path, callback, config);
        } else {
            throw new Error('Cannot load manifest of type ' + type);
        }
    },

    manifest_loaders:{}

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
    console.log('done loading loaders');
}

ondir(__dirname + '/loaders', _on_done_loading_loaders, null, _add_loader);

module.exports = Loader;
