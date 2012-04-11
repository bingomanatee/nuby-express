var events = require('events');
var util = require('util');
var path = require('path');
var fs = require('fs');

var _ = require('./../../node_modules/underscore');
var proper_path = require('./../../node_modules/node-support/proper_path');
var Gate = require('node-support/gate');

function Loader(config) {
    _.extend(this, config);

}

module.exports = Loader;

util.inherits(Loader, events.EventEmitter);

_.extend(Loader.prototype, {

    _item_count:0,

    _time_til_done: 500,

    _timeout: false,

    _prepare_load_handler:function () {
        var self = this;
        this.on('load', function (load_path) {
            if (self.can_load(load_path)) {
                self.load_item(load_path);
            }
        });
        this.on('work_started', function(){
            ++self._item_count;
            console.log("WORK STARTED TO %s", self._item_count);
        });

        this.on('work_done', function(){
            --self._item_count;
            console.log("WORK DONE TO %s", self._item_count);
            if (self._item_count <= 0){
                if (self._timeout){
                    clearTimeout(self._timeout);
                }

                self._timeout = setTimeout(function(){
                    if (self._item_count >0){
                      return  console.log('premature done.');
                    }
                    self.emit('done');
                }, self._time_til_done);
            }
        });
    },

    start_load:function (callback, to_load) {
        this.on('done', callback);
        this._item_count = 1;
        this._prepare_load_handler();
        this.load(to_load);
    },

    load:function (to_load, load_root) {
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
            to_load.forEach(function (to_load_item) {
                self.emit('work_started');
                self.emit('load', to_load_item);
            });
        }
        else {
            path.exists(to_load, function (exists) {
                if (exists) {
                    fs.stat(to_load, function (err, stats) {
                        if (err) {
                            throw(err);
                        } else if (stats.isFile()) {
                            this.emit('work_started');
                            self.emit('load', to_load);
                        } else if (stats.isDirectory()) {
                            self.emit('work_done');
                            switch (self._load_dir_policy) {
                                case 'load':
                                    this.emit('work_started');
                                    self.emit('load', to_load);
                                    break;

                                case 'iterate':
                                    fs.readdir(to_load, function (err, files) {
                                        self.load(files, to_load);
                                    });

                                default:
                                // do nothing.
                            }
                        }
                    });
                } else {
                    throw new Error("cannot find load path " + to_load);
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

    load_item:function (load_path) {
        throw new Error('This class doesn\'t override load_item.')
    }

})