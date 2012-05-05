var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');

var _ = require('./../../node_modules/underscore');
var proper_path = require('./../../node_modules/support/proper_path');
var resource_user = require('./../utility/resource_user');
var async = require('async');
var Base = require('./../utility/Base');
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
        start_load: require('./start_load'),

        _pending_tasks:false,

        _file_count:0,
        _on_load_done:false,
        _all_files_read:false,

        _pending_task_queue:false,

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
                    if (self.loaded){
                        throw new Error('attempt to load ' + self.path + ' twice');
                    }

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

