var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');

var _ = require('./../../node_modules/underscore');
var proper_path = require('./../../node_modules/node-support/proper_path');
var Gate = require('node-support/gate');

var _DEBUG = false;
var _DEBUG_WORK = false;

function Loader(config) {
    _.extend(this, config);

}

module.exports = Loader;

util.inherits(Loader, events.EventEmitter);

/**
 *
 * This is a generic base class for any class in which you want to process files or folders.
 * It emits messages when files or directories are found, that you can process with
 * custom receipt handlers.
 *
 * Note that there needs to be a pairing of work_started emissions
 * with work_done emissions for the 'done' event to be fired.
 * 'work_started' is emitted in the _load_item method.
 * 'work_done' needs to be handled in your custom load_file and load_dir handlers.
 *
 * At this point Loaders are designed to load ONCE; at the very least,
 * if you want to run a loader more than once either
 *  (a) Don't pass in a new callback a second time or
 *  (b) remove the 'done' listener when you are done the first time.
 *  Even so, no guarauntee is made that this will work....
 *
 *  Note - it is QUITE POSSIBLE to have more than one "done" listener...
 *  if a listener is a child executing a subaction of a parent, the parent
 *  might add an on('done'...) handler to close itself out.
 */

_.extend(Loader.prototype, {

    _item_count:0,

    _time_til_done:500,

    _timeout:false,

    _prepare_load_handler:function () {
        var self = this;

        if (this.listeners('load_file').length < 1) {
            this.on('load_file', function (load_path) {
                if (_DEBUG) {
                    console.log('handling laod_file for %s', load_path);
                }
                if (self.can_load(load_path, 'file')) {
                    self.load_file(load_path);
                }
            });
        }

        if (this.listeners('load_dir').length < 1) {
            this.on('load_dir', function (load_path) {
                if (_DEBUG) {
                    console.log('handling laod_dir for %s', load_path);
                }
                if (self.can_load(load_path, 'dir')) {
                    self.load_dir(load_path);
                }
            });
        }

        if (this.listeners('work_started').length < 1) {
            this.on('work_started', function (msg) {
                ++self._item_count;
                if (_DEBUG_WORK) {
                    console.log("WORK STARTED >>UP<< TO %s, %s", self._item_count, msg);
                }
            });


        }

        if (this.listeners('work_done').length < 1) {
            this.on('work_done', function(msg){
                self._check_work_status(msg);
            });
        }
    },

    _check_work_status:function (msg) {
        --this._item_count;
        if (_DEBUG_WORK) {
            console.log("WORK DONE <<DOWN>> TO %s, %s", this._item_count, msg);
        }
        if (this._item_count <= 0) {
            if (this._timeout) {
                clearTimeout(this._timeout);
            }

            var self = this;
            this._timeout = setTimeout(function () {
                if (self._item_count > 0) {
                    return  console.log('premature done.');
                }
                self.emit('done');
            }, this._time_til_done);
        }
    },

    start_load:function (callback, to_load) {
        // @TODO: allow for queueing
        if (callback){
            this.on('done', callback);
        }
        this._item_count = 0;
        this._prepare_load_handler();
        this.load(to_load);
    },

    load:function (to_load, load_root) {

        if (_DEBUG) {
            console.log('load: %s, (%s)', util.inspect(to_load), load_root);
        }
        if (!to_load) {
            throw new Error("load called without load path");
        }

        var self = this;
        if (_.isArray(to_load)) {
            if (_DEBUG) {
                console.log('to_load is array');
            }
            /**
             * if there is a root directory passed in, make all
             * files/path stubs in to_load relative to that root.
             */
            if (load_root) {
                function _merge_files_and_root(file) {
                    return proper_path(load_root) + '/' + file;
                }

                if (_DEBUG) {
                    console.log('no root; iterating on [%s] with root of %s', to_load.join(','), load_root);
                }
                var merged_files = _.map(to_load, _merge_files_and_root);
            } else {
                if (_DEBUG) {
                    console.log('no root; iterating on [%s]', to_load.join(','));
                }
                var merged_files = to_load;
            }

            /**
             * create a seperate "thread" for each path
             */
            merged_files.forEach(function (to_load_item) {
                self._load_item(to_load_item);
            });
        }
        else {
            if (_DEBUG) {
                console.log('to_load is single item');
            }
            self._load_item(to_load);
        }
    },

    _load_item:function (to_load) {
        if (_DEBUG) {
            console.log('loading item %s', to_load);
        }

        if (!this.can_load(to_load)) {
            return;
        }

        var self = this;
        path.exists(to_load, function (exists) {
            if (exists) {
                fs.stat(to_load, function (err, stats) {
                    if (err) {
                        throw(err);
                    } else if (stats.isFile()) {
                        self.emit('work_started', to_load);
                        self.emit('load_file', to_load);
                    } else if (stats.isDirectory()) {
                        switch (self._load_dir_policy) {
                            case 'load':
                                self.emit('work_started', to_load);
                                self.emit('load_dir', to_load);
                                break;

                            case 'iterate':
                                fs.readdir(to_load, function (err, files) {
                                    if (_DEBUG) {
                                        console.log('loading files [%s] of %s', files.join(','), to_load);
                                    }
                                    if (err) throw err;
                                    self.load(files, to_load);
                                });
                            case 'load and iterate':

                                self.emit('work_started', to_load);
                                self.emit('load_dir', to_load);

                                fs.readdir(to_load, function (err, files) {
                                    if (_DEBUG) {
                                        console.log('loading files [%s] of %s', files.join(','), to_load);
                                    }
                                    if (err) throw err;
                                    self.load(files, to_load);
                                });
                                break;
                            default:
                            // do nothing.
                        }
                    }
                });
            } else {
                throw new Error("cannot find load path " + to_load);
            }
        });
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

    /**
     * this is a placehoder for a custom file loading handler.
     * It must be overridden for the child class to function.
     * It MUST emit 'work_done' (pref. with the path loaded in as a parameter).
     * @param load_path
     */
    load_file:function (load_path) {
        throw new Error('This class doesn\'t override load_item.')
    },

    /**
     * this is a placehoder for a custom directory loading handler.
     * It must be overridden for the child class to function.
     * It MUST emit 'work_done' (pref. with the path loaded in as a parameter).
     * @param load_path
     */
    load_dir:function (load_path) {
        throw new Error('This class doesn\'t override load_item.')
    }

})
