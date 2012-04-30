var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');
var _ = require('./../../node_modules/underscore');

var proper_path = require('./../../node_modules/support/proper_path');
var Gate = require('support/gate');
var resource_loader = require('./../utility/resource_loader');
var handler_loader = require('./../utility/handler_loader');

var _DEBUG = false;
var _DEBUG_WORK = true;

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
 * At this point Loaders are designed to load ONCE.
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

        this.on('load_item', function (load_path, target, handlers) {
            self._load_item(load_path, target, handlers);
        });

        this.on('load_file', function (load_path, target, handlers) {
            self._load_file(load_path, target, handlers);
        });

        this.on('load_dir', function (load_path, target, handlers) {
            self._load_dir(load_path, target, handlers);
        });

        this.on('work_started', function (msg) {
            ++self._item_count;
            if (_DEBUG_WORK) console.log('work started %s: count = %s', msg, self._item_count);
        });

        this.on('work_done', function (msg) {
            --self._item_count;
            if (this._item_count <= 0) {
                self._check_work_status();
            }
            if (_DEBUG_WORK) console.log('work done %s: count = %s', msg, self._item_count);
        });

        this._load_handlers_loaded = true;
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
            }, Math.max(10, this._time_til_done));
        }
    },

    /** ***************** LOAD CYCLE **************** */

    start_load: require('./start_load'),

    load:function (to_load, callback, load_root, target, handlers) {
        if (!to_load) {
            throw new Error("load called without load path");
        }

        var self = this;
        if (_.isArray(to_load)) {
            /**
             * if there is a root directory passed in, make all
             * files/path stubs in to_load relative to that root.
             */
            if (load_root) {
                var proper_root = proper_path(load_root);
                to_load = _.map(to_load, function (file) {
                    return proper_root + '/' + file;
                });
            }

            /**
             * create a seperate "thread" for each path
             */
            to_load.forEach(function (to_load_item) {
                self.emit('load_item', to_load_item, target, handlers);
            });
            process.nextTick(callback);
        } else {
            if (!target || _.isObject(load_root)) {
                target = load_root;
                load_root = '';
            }
            self.emit('load_item', to_load, target, handlers);
           process.nextTick(callback);
        }
    },

    _load_item:function (to_load, target, handlers) {
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
                        if (handlers) {
                            var file_handlers = _.filter(handlers, function (h) {
                                return h.type == 'file';
                            })
                            self.emit('load_file', to_load, target, file_handlers);
                        } else {
                            self.emit('load_file', to_load, target);

                        }
                    } else if (stats.isDirectory()) {
                        if (handlers) {
                            var dir_handlers = _.filter(handlers, function (h) {
                                return h.type == 'dir';
                            })
                            self.emit('load_dir', to_load, target, dir_handlers);
                        } else {
                            self.emit('load_dir', to_load, target);
                        }
                    }
                });
            } else {
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
    _load_file:function (load_path, target, file_handlers) {
        if (!file_handlers) {
            file_handlers = this.handlers('file');
        }

        var handled = false;
        var self = this;

        for (var i = 0; (i < file_handlers.length) && (!handled); ++i) {
            var handler = file_handlers[i];
            if (handler.type == 'file') {
                var wdc = self.start_and_wdc('done loading file ' + load_path);
                handled = handler.handle(load_path, wdc, target);
                if (!handled) {
                    wdc();
                }
            }
        }

    },

    /**
     * Filters the path through the chosen loaders.
     * @param load_path
     */
    _load_dir:function (load_path, target, dir_handlers) {
        if (!dir_handlers) {
            dir_handlers = this.handlers('dir');
        }
        var handled = false;

        for (var i = 0; (i < dir_handlers.length) && (!handled); ++i) {
            var handler = dir_handlers[i];
            if (handler.type == 'dir') {
                this.emit('work_started', load_path);
                var wdc = this.work_done_callback('done loading dir handler ' + handler.name);
                handled = handler.handle(load_path, wdc, target);
                if (!handled) {
                    wdc();
                }
            }
        }
    },

    start_and_wdc: function(){
        var msg = '';
        var props = [].slice.call(arguments, 0);
        if (arguments.length) {
            if (arguments.length > 1) {
                msg = util.format.call(util, props);
            } else {
                msg = props[0];
            }
        }

        var id = ++wdc_id;

        msg = util.format('[[ %s ]] %s', id, msg);
        this.emit('work_started', 'START ' + msg);
        return this.work_done_callback('END ' + msg);
    },

    /**
     * Creates a callback that, when executed, decrements the work queue.
     * @TODO: allow for error handling.
     */

    work_done_callback:function () {
        var msg = '';
        var props = [].slice.call(arguments, 0);
        if (arguments.length) {
            if (arguments.length > 1) {
                msg = util.format.call(util, props);
            } else {
                msg = props[0];
            }
        }

        var self = this;

        var done = false;
        return function () {
            if (done){
                throw new Error('WDC called twice!' + msg);
            } else {
                done = true;
                self.emit('work_done', msg);
            }
        }
    }


}, handler_loader, resource_loader);

var wdc_id = 0;