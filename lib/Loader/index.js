var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');

var _ = require('./../../node_modules/underscore');
var proper_path = require('./../../node_modules/support/proper_path');
var Gate = require('support/gate');

var _DEBUG = false;
var _DEBUG_WORK = false;

/**
 * note - by default no activity happens in a loader's prototype
 * so you are free to do whatever with a child's prototype.
 */

function Loader() {
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
 *  might add an on('done'...) handlers to close itself out.
 */

_.extend(Loader.prototype, {

    _item_count:0,

    _time_til_done:500,

    _status_interval:false,

    _load_handlers_loaded:false,

    _prepare_load_handler:function () {
        if (this._load_handlers_loaded) {
            return;
        }
        var self = this;

        this.on('load_file', function (load_path, target) {
            if (_DEBUG) {
                console.log('handling laod_file for %s', load_path);
            }
            self.load_file(load_path, target);
        });

        this.on('load_dir', function (load_path, target) {
            if (_DEBUG) {
                console.log('handling load_dir for %s', load_path);
            }
            self.load_dir(load_path, target);
        });

        this.on('work_started', function (msg) {
            ++self._item_count;
            if (_DEBUG_WORK) {
                console.log("WORK STARTED >>UP<< TO %s, %s", self._item_count, msg);
            }
        });

        this.on('work_done', function (msg) {
            --this._item_count;
            if (_DEBUG_WORK) {
                console.log("WORK DONE <<DOWN>> TO %s, %s", this._item_count, msg);
            }
            if (this._item_count <= 0) {
                self._check_work_status();
            }
        });
    },

    _check_work_status:function () {
        var self = this;
        if (this._item_count <= 0) {
            if (this._status_interval) {
                clearInterval(self._status_interval);
            }

            this._status_interval = setInterval(function () {
                if (self._item_count > 0) {
                    return; //  console.log('not done yet ....');
                } else {
                    self.emit('load_done');
                    clearInterval(self._status_interval);
                }
            }, this._time_til_done);
        }
    },

    /** ***************** LOAD CYCLE **************** */

    start_load:function (callback, to_load, target) {
        if (!target) {
            target = this;
        }

        if (!this.path){
            this.path = to_load;
        }

        if (!_.isFunction(callback)) {
            throw new Error(util.format("attempt to start_load with non function: %s", util.inspect(callback)));
        }
        // @TODO: allow for queueing
        if (this._status_interval) {
            clearInterval(this._status_interval);
        }
        this._item_count = 0;
        this._prepare_load_handler();
        var self = this;


        fs.readdir(to_load, function (err, files) {
            if (err) {
                throw err;
            }
            if (callback) {
                self.on('load_done', function () {
                    self.on('after_load', callback);
                    // ensures the callback executes AFTER all pre-existing after-load's have been executed,
                    // encluding any that have been added in the loading process;
                    self.emit('after_load')
                });
            }
            self.load(files, to_load, target);

        })
    },

    load:function (to_load, load_root, target) {

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
                to_load = _.map(to_load, _merge_files_and_root);
            } else {
                if (_DEBUG) {
                    console.log('no root; iterating on [%s]', to_load.join(','));
                }
            }

            /**
             * create a seperate "thread" for each path
             */
            to_load.forEach(function (to_load_item) {
                self._load_item(to_load_item, target);
            });
        }
        else {
            if (_DEBUG) {
                console.log('to_load is single item');
            }
            if (!target || _.isObject(load_root)) {
                target = load_root;
                load_root = '';
            }
            self._load_item(to_load, target);
        }
    },

    _load_item:function (to_load, target) {
        if (this.can_load(to_load)) {
            if (_DEBUG) {
                console.log('loading item %s, read_dots = ', to_load, this.hasOwnProperty('read_dots') ? (this.read_dots ? 'y' : 'n') : 'undef');
            }
        } else {
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
                        self.emit('load_file', to_load, target);
                    } else if (stats.isDirectory()) {
                        self.emit('work_started', to_load);
                        self.emit('load_dir', to_load, target);
                    }
                });
            }
        });
    },

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
        return true;
    },

    /**
     * Filters the path through the chosen loaders.
     * @param load_path
     */
    load_file:function (load_path, target) {
        var file_handlers = this.handlers('file');
        var handled = false;
        var wdc = this.work_done_callback();

        for (var i = 0; (i < file_handlers.length) && (!handled); ++i) {
            var handler = file_handlers[i];
            handled = handler.handle(load_path, wdc, target);
        }

        if (!handled) {
            this.emit('work_done', util.format('ignoring %s', load_path));
        }
    },

    /**
     * Filters the path through the chosen loaders.
     * @param load_path
     */
    load_dir:function (load_path, target) {
        var dir_handlers = this.handlers('dir');
        var handled = false;
        var wdc = this.work_done_callback();

        for (var i = 0; (i < dir_handlers.length) && (!handled); ++i) {
            var handler = dir_handlers[i];
            handled = handler.handle(load_path, wdc, target);
        }

        if (!handled) {
            this.emit('work_done', util.format('ignoring %s', load_path));
        }
    },

    /**
     * Creates a callback that, when executed, decrements the work queue.
     * @TODO: allow for error handling.
     */
    work_done_callback:function () {
        var msg = '';
        if (arguments.length) {
            if (arguments.length > 1) {
                var props = [].slice.call(arguments, 0);
                msg = util.format.call(util, props);
            } else {
                msg = props[0];
            }
        }

        var self = this;

        return function () {
            self.emit('work_done', msg);
        }
    },

    /* ***************** HANDLERS ***************** */

    _handlers:false,

    /**
     * Note - because handlers are registered with their owners (registrees?),
     * handlers must be output from factory functions, not shared between resources.
     * @param handler
     */
    add_handler:function (handler) {
        handler.owner = this;
        if (!this._handlers) {
            this._handlers = [];
        }
        this._handlers.push(handler);
    },

    filter_handlers:function (filter) {
        this._handlers = _.filter(this._handlers, filter);
    },

    handlers:function (type) {
        var handlers = [];
        if (this._handlers) {

            if (type) {
                this._handlers.forEach(function (handler) {
                    if (handler.type == type) {
                        //@TODO: handle complex filter types
                        handlers.push(handler);
                    }
                });
            } else {
                handlers = this._handlers.slice(0);
            }
        }

        return handlers;
    }

});

