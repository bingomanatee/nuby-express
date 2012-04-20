var ondir = require('./../support/ondir');
var fs = require('fs');
var path = require('path');
var Controller = require('../controller');
var util = require('util');
var _ = require('../../node_modules/underscore');
var Gate = require('./../support/gate');
var prop_extend = require('./../req_state/prop_extend');
var file_finder = require('../file_finder');
var model_loader = require('model_loader.js');

function _debug(msg, param, b, c) {
   //return;
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
                _debug("START LOADING APP: %s", rp);
                var cb = gate.task_done_callback(true);
                self.load(framework, cb, rp);
            });

            gate.start();
            return;
        }

       _debug('loading controllers in root %s', root_path);

        function _after_init(){

            _debug('AFTER INIT: for path %s', root_path);

            function _load_controller_closure(full_path, done_cb) {
                _debug('load controller closure: for controller path %s', full_path);
                var controller = self.init_controller(full_path, framework);
                self.load_controller(controller, done_cb);
            }

            function _no_path_closure(root_path, callback) {
                _debug('nuby loader:: No root path %s', root_path);
                callback();
            }

            ondir(root_path, callback, null, _load_controller_closure, _no_path_closure);
        }

        self.init(framework, root_path, _after_init);
    },
    _init_path_patterns:[
        '%s/index.js',
        '%s/component.js',
        function (n) {
            return util.format('%s/%s.js', n, path.basename(n));
        }
    ],

    _get_init:function (root_path) {
        var out = file_finder(root_path, this._init_path_patterns, true);
        return out ? out : {};
    },

    init: function(framework, root_path, cb){
        var app_init = this._get_init(root_path);
        if (app_init && app_init.hasOwnProperty('load')){

            function _timed_out(){
                console.log("############## TOO LONG TO LOAD: %s ###########", root_path);
                process.kill(process.pid);
            }
            var _too_long_to_load = setTimeout(_timed_out, 10000);
            function _on_done(){
                console.log('||||||||-------------- DONE WITH INIT: %s ------------', root_path);
                clearTimeout(_too_long_to_load);
                cb();
            }
            app_init.load(framework, _on_done);
        } else {
            cb();
        }
    },

    init_controller:function (full_path, framework) {

        var config = this._get_config(full_path);
        // console.log('********* init_controller: init controller at %s, info =', full_path, util.inspect(config));

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

    /** each controller exists in a dir; this handles a single controller **/

    load_controller:function (controller, done_cb) {
        var self = this;

        _debug(util.format("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% \nload_controller: controller.name = %s \n %%%%%%%%%%%%%%%%%%%%%%%%", controller.name));

        function _on_models_loaded() {

            function _on_resources_loaded() {
                console.log(' ########## RESOURCE LOAD DONE: loading actions for controller %s', controller.path);
                function _actions_loaded() {
                    if (controller.hasOwnProperty('on_load')) {
                        controller.on_load(done_cb);
                    } else {
                        done_cb();
                    }
                }

                if (controller.hasOwnProperty('manifest')) {

                    _debug('MANIFEST IN %s: %s', controller.path, util.inspect(controller.manifest));

                    controller.manifest.forEach(function (manifest) {
                        self.load_controller_manifest_def(controller, manifest, _actions_loaded);
                    });
                } else {
                    _debug('NO MANIFEST in %s', controller.path);
                    self.load_controller_manifest(controller, 'actions', 'default', _actions_loaded);
                }

                if (path.existsSync(controller.path + '/sub_controllers')) {
                    _debug('SEEKING SUB CONTROLLERS IN %s', controller.path + '/sub_controllers');
                    self.load_controller_manifest(controller, 'sub_controllers', 'sub_controllers', done_cb);
                } else {
                    _debug('NO SUB CONTROLLERS IN %s', controller.path + '/sub_controllers');
                }
            }

            self._load_controller_resources(controller, _on_resources_loaded);
        }

        this._load_controller_models(controller, _on_models_loaded);

    },

    _load_controller_models: model_loader,

    _load_controller_resources:function (controller, on_done) {

        var resources_path = controller.path + '/resources';

        _debug('looking for resources in %s', resources_path);

        if (path.existsSync(resources_path)) {

            var gate = new Gate(function(){
                _debug(' $$$$$$$$$$$ done loading resources for %s', controller.path);
                on_done();
            });

            function _on_resource_file(mpath, file_done) {
                var resource = require(mpath);
                var name = path.basename(mpath, '.js');
                _debug('                 -------- LOADING RESOURCE %s from path %s', name, mpath);

                function _on_resource(err, resource) {
                    controller.framework.resources[name] = resource;
                    gate.task_done();
                }

                gate.task_start();
                resource(controller, _on_resource);

                file_done();
            }

            ondir(resources_path, function () {
                console.log('======================== starting gate for path %s', controller.path);
                gate.start();
            }, _on_resource_file);


        } else {

            _debug('... no resources %s', resources_path);
            on_done();
        }

    },

    /**
     * note - no matter what JS file is loaded, controller's path is its directory root.
     */

    _controller_paths:[
        '%s/index.js',
        '%s/controller.js'
    ],

    _get_config:function (full_path) {
      //  console.log('looking for controller in %s', full_path);
        for (var i = 0; i < this._controller_paths.length; ++i) {
            var index_file = util.format(this._controller_paths[i], full_path);
            //console.log('looking for controller for %s in %s', full_path, index_file);
            if (path.existsSync(index_file)) {
                //  console.log('... FOUND');
                return require(index_file);
            } else {
                //  console.log('... NOT FOUND');
            }
        }
        _debug('... returning DEFAULT EMPTY CONTROLLLER');
        return {};
    },

    load_controller_manifest_def:function (controller, manifest, callback) {
        _debug("----------------- \nload_controller_manifest_def: %s %s \n -------------------", controller.path,  util.inspect(manifest));
        var type = 'default';
        var config = {};

        if (_.isString(manifest)) {
            _debug(util.format('load_controller_manifest_def %s (%s) for %s', manifest, type, controller.path));
            // assume it is an actions directory of default actions.
            this.load_controller_manifest(controller, manifest, type, callback);
        } else {
            if (manifest.hasOwnProperty('type')) {
                type = manifest.type;
            }
            if (manifest.hasOwnProperty('config')){
                config = manifest.config;
            }
            manifest = manifest.path;
            // it is an action directory
        }
        _debug('############## load_controller_manifest_def controller = %s manifest path = %s (%s) ',controller.path, manifest, type);
        this.load_controller_manifest(controller, manifest, type, callback, config);
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