var ondir = require('./../support/ondir');
var fs = require('fs');
var path = require('path');
var Controller = require('./../controller');
var util = require('util');
var _ = require('./../../node_modules/underscore');
var Gate = require('./../support/gate');
var prop_extend = require('./../req_state/prop_extend');
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
        if (!_.isFunction(callback)) {
            throw new Error(util.format('Loader callback is not a function: %s', util.inspect(callback)));
        }
        var self = this;

        if (_.isArray(root_path)) {
            var gate = new Gate(callback);

            root_path.forEach(function (rp) {
                var cb = gate.task_done_callback(true);
                self.load(framework, cb, rp);
            });

            gate.start();
            return;
        }

        //   console.log('loading %s', root_path);

        if (!root_path) {
            root_path = framework.path + '/app';
        }

        _debug(util.format('loading %s', root_path));

        function _load_controller_closure(full_path, done_cb) {
            var controller = self.init_controller(full_path, framework);
            self.load_controller(controller, done_cb);
        }

        function _no_path_closure(root_path, callback) {
            _debug('nuby loader:: No root path %s', root_path);
            callback();
        }

        ondir(root_path, callback, null, _load_controller_closure, _no_path_closure);
    },

    init_controller:function (full_path, framework) {
        var config = this._get_config(full_path);

        var controller = new Controller(config);

        controller.framework = framework;
        controller.path = full_path;

        if (!controller.hasOwnProperty('name')) {
            controller.name = path.basename(full_path);
        }

        prop_extend(framework.params, controller.params);

        framework.controllers.push(controller);
        return controller;
    },

    /** each controller eists in a dir; this handles a single controller **/

    load_controller:function (controller, done_cb) {
        var self = this;

        _debug(util.format('load_controller: controller.name = %s', controller.name));

        function _on_models_loaded() {

            function _on_resources_loaded() {

                if (controller.hasOwnProperty('manifest')) {

                    _debug('MANIFEST IN %s: %s', controller.path, util.inspect(controller.manifest));

                    controller.manifest.forEach(function (manifest) {
                        self.load_controller_manifest_def(controller, manifest, done_cb);
                    });
                } else {
                    _debug('NO MANIFEST in %s', controller.path);
                    self.load_controller_manifest(controller, 'actions', 'default', done_cb);
                    if (path.existsSync(controller.path + '/sub_controllers')) {
                        self.load_controller_manifest(controller, 'sub_controllers', 'sub_controllers', done_cb);
                    }
                }
            }

            self._load_controller_resources(controller, _on_resources_loaded);
        }

        this._load_controller_models(controller, _on_models_loaded);

    },

    _load_controller_models:function (controller, on_done) {

        var models_path = controller.path + '/models';

        if (path.existsSync(models_path)) {

            function _on_model_file(mpath, file_done) {
                var model = require(mpath);
                var name = path.basename(mpath, '.js');
                controller.framework.models[name] = model();

                file_done();
            }

            ondir(models_path, on_done, _on_model_file);

        } else {
            on_done();
        }


    },

    _load_controller_resources:function (controller, on_done) {

        var resources_path = controller.path + '/resources';

        if (path.existsSync(resources_path)) {

            function _on_resource_file(mpath, file_done) {
                var resource = require(mpath);
                var name = path.basename(mpath, '.js');
                console.log(' -------- LOADING RESOURCE %s', name);
                controller.framework.resources[name] = resource(controller.framework);

                file_done();
            }

            ondir(resources_path, on_done, _on_resource_file);

        } else {
            on_done();
        }

    },

    _sub_controllers:function (controller, sub_cont_path, done_cb) {
        // DEPRECATED
        var submodule = require(sub_cont_path);
        var sub_controller = submodule.hasOwnProperty('controller') ? submodule.controller : submodule;

        var no_manifest = (!sub_controller.hasOwnProperty('manifest'));
        if (sub_controller.extend) {
            _.defaults(sub_controller, controller);
        }
        sub_controller.path = submodule_path;

        if (no_manifest) {
            delete sub_controller.manifest;
        }

        var Loader = require('./../../index');

        var loader = new Loader();

        loader.load_controller(sub_controller, done_cb);
    },

    /**
     * note - no matter what JS file is loaded, controller's path is its directory root.
     */

    _controller_paths:[
        '%s/index.js',
        '%s/controller.js'
    ],

    _get_config:function (full_path) {
        for (var i = 0; i < this._controller_paths.length; ++i) {
            var index_file = util.format(this._controller_paths[i], full_path);
            _debug('looking for controller for %s in %s', full_path, index_file);
            if (path.existsSync(index_file)) {
                _debug('... FOUND');
                return require(index_file);
            }
        }
        _debug('... returning DEFAULT EMPTY CONTROLLLER');
        return {};
    },

    load_controller_manifest_def:function (controller, manifest, callback) {
        _debug('load_controller_manifest_def: %s', util.inspect(manifest));
        var type = 'default';
        if (manifest.hasOwnProperty('type')) {
            type = manifest.type;
        }

        if (_.isString(manifest)) {
            _debug(util.format('load_controller_manifest_def %s (%s) for %s', manifest, type, controller.path));
            // assume it is an actions directory of default actions.
            this.load_controller_manifest(controller, manifest, type, callback);
        } else {
            _debug('load_controller_manifest_def manifest path = %s (%s) ', manifest.path, type);
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
