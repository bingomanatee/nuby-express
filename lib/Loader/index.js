var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');

var _ = require('underscore');
var proper_path = require('node-support/proper_path');
var Gate = require('node-support/gate');

function Loader(config, callback, to_load, load_root) {
    _.extend(this, config);

    if (callback) {
        this._init_load(callback, to_load, load_root);
    }

}

util.inherits(Loader, events.EventEmitter);

_.extend(Loader.prototype, {

    /**
     * Note - this method is in reality unlikely to be callec
     * because most implementers will have their own loaders.
     *
     * @param callback
     * @param to_load
     * @param load_root
     */

    _init_load:function (callback, to_load, load_root) {

        if (callback && to_load) {
            this.load(callback, to_load, load_root)
        } else if (callback) {
            if (!load_root && this.hasOwnProperty('_load_root') && this._load_root) {
                load_root = this._load_root;
            }
            if (!to_load && this.hasOwnProperty('_to_load') && this._to_load) {
                to_load = this._to_load;
            }
            this.load(callback, to_load, load_root);
        } else {
            throw new Error('_init_load callled without callback');
        }
    },

    _prepare_load_handler:function () {
        var self = this;
        if (!this.listeners('load').length > 0){
            this.on('load', function(load_path, callback){
                if (self.can_load(load_path)){
                    self.load_item(load_path, callback);
                } else {
                    callback(null, 'cannot load ' + load_path);
                }
            });
        }
    },

    load:function (callback, to_load, load_root) {
        if (!to_load) {
            return callback(new Error("load called without load path"));
        }

        this._prepare_load_handler();

        var self = this;
        if (_.isArray(to_load)) {
            /**
             * if there is a root directory passed in, make all
             * files/path stubs in to_load relative to that root.
             */
            if (load_root) {
                function _merge_files_and_root(file) {
                    return proper_path(load_root) + '/' + file;
                }

                to_load = _.map(to_load, _merge_files_and_root);
            }

            /**
             * create a seperate "thread" for each ALLOWED path and only call the callback
             * when all the threads are loaded. Note - can be expansive if this
             * loader allows nesting.
             */
            var gate = new Gate(callback);
            to_load.forEach(function (to_load_item) {
                self.emit('load', to_load_item, gate.task_start_callback(true));
            });
            gate.start();
        }
        else {
            path.exists(to_load, function (exists) {
                if (exists) {
                    fs.stat(to_load, function (err, stats) {
                        if (err) {
                            callback(err);
                        } else if (stats.isFile()) {
                            self.emit('load', to_load, callback);
                        } else if (stats.isDir()) {
                            switch (self._load_dir_policy) {
                                case 'load':
                                    self.emit('load', to_load, callback);
                                    break;

                                case 'iterate':
                                    fs.readdir(to_load, function (err, files) {
                                        self.load(callback, files, to_load);
                                    });

                                default:
                                // do nothing.
                            }
                        }
                    });
                } else {
                    callback(new Error("cannot find load path " + to_load));
                }
            });
        }
    },

    _load_dir_policy:'iterate',

    /**
     * The inheriting class has to define the proper path for the type of files it can load
     * until it does the presumption is the loader can't load ANYTHING.
     *
     * Note - this method is SYNCHRONOUS - getting a little lazy here - so must use
     * only SYNCHRONOUS file methods (or other sorts..)
     *
     * @param path
     */

    can_load:function (load_path) {
        throw new Error('This class doesn\'t override can_load.')
    },

    load_item:function (load_path, callback) {
        throw new Error('This class doesn\'t override load_item.')
    }

})