var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var Gate = require('support/gate');
var logger = require('./../utility/logger');
var proper_path = require('support/proper_path')
var path = require('path');

var File_Props = require('./File_Props');

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = function (callback, root, frame, context) {
    if (frame && !/app$/.test(frame.path)){
        console.log('bad framework for %s: %s', root, frame.path);
        throw new Error('BAD FRAME' +frame.path);
    }

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
    if (!self._load_done_count){
        self._load_done_count = 0;
    }
    ++ self._load_done_count;

    var proper_root = proper_path(root) + '/';
    this.removeAllListeners('load_done');
    this.on('load_done', function () {

        if (self._load_done_count > 1){
            console.log('ACTION load done: %s times for %s', self._load_done_count, self.path);
            throw new Error('.... and that is too many');
        }
        if (self.loaded) {
            throw new Error('attempt to load ' + self.path + ' twice');
        }

        self.loaded = true;
        callback();
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


    var file_gate = new Gate(function () {
        self._pending_task_gate.start();
    }, 'loader: start load ' + root);
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
                        props.log('emitting file')
                        self.emit('handle_file', props)
                    }

                    if (stat.isDirectory()) {
                        props.log('emitting dir');
                        self.emit('handle_dir', props)
                    }
                }
                file_gate.task_done();
            });
        });

        file_gate.start();

    });
    file_gate.task_done();
}