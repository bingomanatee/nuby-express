var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');

var _ = require('./../../node_modules/underscore');
var proper_path = require('./../../node_modules/support/proper_path');
var resource_user = require('./../utility/resource_user');
var async = require('async');

var _DEBUG = false;
var _DEBUG_WORK = true;

/**
 * note - by default no activity happens in a loader's prototype
 * so you are free to do whatever with a child's prototype.
 */

function Loader() {
    this.id();
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

var _layout_id = 0;

_.extend(Loader.prototype, {

    CLASS: 'Loader',

    _item_count:0,

    _time_til_done:500,

    _status_interval:false,

    _load_handlers_loaded:false,

    /* *************** ID ********************** */

    _id:false,

    id:function () {
        if (!this._id) {
            this._id = ++_layout_id;
        }
        return this.CLASS + ' ' + this._id;
    },

    /** ***************** LOAD CYCLE **************** */

    _pending_handlers:0,
    start_load:function (callback, root, frame, context) {

        if (!(this._pending_handlers == 0)) {
            throw new Error('attempt to load path %s with incomplete laoder', root);
        }

        if (!frame) {
            frame = this;
        }

        if (!context) {
            context = this;
        }

        if (!this.path) {
            this.path = root;
        } else if (!root) {
            root = this.path;
        } else {
            throw new Error('no root passed OR path present on start_load');
        }

        if (!_.isFunction(callback)) {
            throw new Error(util.format("attempt to start_load %s with non function: %s", root, util.inspect(callback)));
        }

        var self = this;

        var proper_root = proper_path(root) + '/';

        this.on('load_done', callback);

        fs.readdir(root, function (err, files) {
            self._pending_tasks = [];
            self.removeAllListeners('on_pending_task');
            self.addListener('on_pending_task', function (task, full_path, handler) {
                self._pending_tasks.push(task);
                console.log('handler %s registering task for path %s', handler, full_path);
            })

            files = _.filter(files, function (file) {
                return self.can_load(proper_root + file);
            })

            var read_queue = async.queue(function (file, callback) {
                var full_path = proper_root + file;
                fs.stat(full_path, function (err, stat) {
                    if (stat) {
                        if (stat.isFile()) {
                            self.emit('handle_file', {
                                context:context,
                                stat:stat,
                                frame:frame,
                                file:file,
                                root:root,
                                full_path:full_path,
                                loader:self
                            })
                        }

                        if (stat.isDirectory()) {
                            self.emit('handle_dir', {
                                context:context,
                                stat:stat,
                                frame:frame,
                                file:file,
                                root:root,
                                full_path:full_path,
                                loader:self
                            })
                        }
                    }
                    callback();
                });
            }, 4);

            read_queue.drain = function(){
                self._all_files_read = true;
                self.check_file_count();
            };

            read_queue.push(files, function(){console.log('READ ALL FILES IN %s; %s pending tasks' ,
                self.path, self._pending_tasks.length
                )});
        });

    },

    _pending_tasks:false,

    _file_count:0,
    _on_load_done:false,
    _all_files_read:false,

    check_file_count:function () {
        if (this._all_files_read && (this._file_count == 0)) {
            var self = this;
            async.parallel(this._pending_tasks, function(){
                self.emit('load_done');
            });
        }
    },

    file_started:function (full_path) {
        ++this._file_count;
    },

    file_done:function (full_path) {
        --this._file_count;
        this.check_file_count();
    },

    /*
     handler_timeout:500,

     _handler_timeout_interval:false,

     handler_start:function () {
     this._kill_timeout_clock();
     ++this._pending_handlers;
     if (_DEBUG_WORK) console.log('%s - START - loader %s, count = %s', msg, this.id(), this._pending_handlers);
     },

     handler_done:function (msg) {
     --this._pending_handlers;
     if (_DEBUG_WORK) console.log('%s - DONE - loader %s, count = %s', msg, this.id(), this._pending_handlers);
     if (this._pending_handlers == 0) {
     if (_DEBUG_WORK) console.log('HANDLER FINISHED ----- %s for loader %s,', msg, this.id());
     this._start_timeout_clock();
     }
     },

     _kill_timeout_clock:function () {
     if (this._handler_timeout_interval) {
     clearTimeout(this._handler_timeout_interval);
     }
     },
     _start_timeout_clock:function () {
     this._kill_timeout_clock();
     var self = this;
     this._handler_timeout_interval = setTimeout(function () {
     self.emit('load_done');
     }, this.handler_timeout);
     },

     */

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

    /* ***************** HANDLERS ***************** */

    _handlers:false,

    /**
     * Note - because handlers are registered with their owners (registrees?),
     * handlers must be output from factory functions, not shared between resources.
     * @param handler
     */
    add_handler:function (handler) {
        switch (handler.type) {
            case 'file':
                this.on('handle_file', function (props) {
                    handler.handle(props);
                });
                break;

            case'dir':
                this.on('handle_dir', function (props) {
                    handler.handle(props);
                });
                break;

            case '*':
                this.on('handle_file', function (props) {
                    handler.handle(props);
                });

                this.on('handle_dir', function (props) {
                    handler.handle(props);
                });
        }

        if (!this._handlers) {
            this._handlers = [];
        }

        this._handlers.push(handler);
    }

}, resource_user);

