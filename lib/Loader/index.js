var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');

var _ = require('./../../node_modules/underscore');
var proper_path = require('./../../node_modules/support/proper_path');
var resource_user = require('./../utility/resource_user');
var async = require('async');
var Base = require('./../utility/Base');
var File_Props = require('./File_Props');
var _DEBUG = false;
var _DEBUG_WORK = true;
var logger = require('./../utility/logger');
var Gate = require('support/Gate');

/**
 * note - by default no activity happens in a loader's prototype
 * so you are free to do whatever with a child's prototype.
 */

function Loader(config) {
    Base.call(this, config);
    this._pending_task_queue = [];
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

_.extend(Loader.prototype, Base.prototype, {

        CLASS:'Loader',

        _item_count:0,

        _time_til_done:500,

        _status_interval:false,

        _load_handlers_loaded:false,

        /** ***************** LOAD CYCLE **************** */

        _pending_handlers:0,
        start_load:function (callback, root, frame, context) {
            logger.log({msg:'Starting load',
                root:root,
                context:(context ? context.to_JSON() : 'none')});

            if (!(this._pending_handlers == 0)) {
                throw new Error('attempt to load path %s with incomplete laoder', root);
            }

            if (!frame) {
                frame = this;
            }

            if (!context) {
                context = this;
            }

            if (this.path) {
                if (!root) {
                    root = this.path;
                }
            } else if (root) {
                if (root) {

                    this.path = root;
                } else {
                    throw new Error('Loader started with no root OR path: ' + util.inspect(this, true));
                }
            }

            if (!_.isFunction(callback)) {
                throw new Error(util.format("attempt to start_load %s with non function: %s", root, util.inspect(callback)));
            }

            var self = this;

            var proper_root = proper_path(root) + '/';

            this.on('load_done', callback);
            this.on('load_done', function () {
                self.loaded = true;
            })

            self._pending_task_gate = new Gate(function () {
                logger.log({msg:'pending task queue drained', loader:self.id()});
                self._begin_done_countdown();
            }, 'pending tasks for ' + self.id());
           // self._pending_task_gate.debug = true;

            self.removeAllListeners('on_pending_task');
            self.addListener('on_pending_task', function (task, full_path, handler) {
                self._pending_task_gate.task_start();
                task(self._pending_task_gate.task_done_callback());
            })


            var file_gate = new Gate(function(){
                self._pending_task_gate.start();
            })
          //  file_gate.debug = true;
            file_gate.name = 'file_reader ' + path.basename(root);
            file_gate.task_start();
            fs.readdir(root, function (err, files) {
                self._pending_tasks = [];
                files = _.filter(files, function (file) {
                    return self.can_load(proper_root + file);
                })

                files.forEach(function (file) {
                    var full_path = proper_root + file;
                    file_gate.task_start();
                    fs.stat(full_path, function (err, stat) {
                        if (stat) {
                            var props = new File_Props({
                                context:context,
                                stat:stat,
                                frame:frame,
                                file:file,
                                root:root,
                                full_path:full_path,
                                loader:self
                            });

                            if (stat.isFile()) {
                                props.log('emitting')
                                self.emit('handle_file', props)
                            }

                            if (stat.isDirectory()) {
                                props.log('emitting');
                                self.emit('handle_dir', props)
                            }
                        }
                        file_gate.task_done();
                    });
                });

                file_gate.start();

            });
            file_gate.task_done();
        },

        _pending_tasks:false,

        _file_count:0,
        _on_load_done:false,
        _all_files_read:false,

        _pending_task_queue:false,

        check_file_count:function () {
            var self = this;
            logger.log({msg:'checking file count', loader:this.id()});
            if (this._all_files_read && (this._file_count == 0)) {
                logger.log({msg:'all files read and handled', loader:this.id()});

                if (this._pending_tasks.length > 0) {
                    logger.log({msg:'pending tasks found', pending_tasks:this._pending_tasks.length, loader:this.id()});

                    this._pending_task_queue.task_start();
                    this._pending_tasks.forEach(function (task) {
                        task(function () {
                            logger.log('finished pending task', {task:task.toString()});
                            self._pending_task_gate.task_done();
                        });
                    })
                    this._pending_tasks = [];
                    this._pending_task_gate.start();
                } else {
                    self._begin_done_countdown();
                }

            } else {
                logger.log({msg:"check_file_count - skipping", _all_files_read:this._all_files_read, file_count:this._file_count});
                return false;
            }
        },

        _pt_string:function () {
            return _.map(this._pending_tasks, function (t) {
                return t.toString()
            });
        },

        _done_countdown:false,
        load_done:false,

        _begin_done_countdown:function () {
            logger.log('beginning done countdown');
            if (this._done_countdown) {
                clearTimeout(this._done_countdown);
            }
            var self = this;
            this._done_countdown = setTimeout(
                function () {
                    logger.log({msg:'COUNTDOWN REACHED! emitting load done', loader:self.id()});
                    self.emit('load_done');
                },
                this._time_til_done
            );
        },

        file_started:function (full_path) {
            ++this._file_count;
        },

        file_done:function (full_path) {
            --this._file_count;
            this.check_file_count();
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
        },

        id:function () {
            return Base.prototype.id.call(this) + 'loader for dir ' + path.basename(this.path);
        },

        /* ***************** REPORTING ************* */

        _JSON_report:require('./../utility/JSON_report'),

        to_JSON:function (switches) {
            var out = this._JSON_report(switches);
            out.file_count = this._file_count;
            return out;
        }
    },
    resource_user
)
;

