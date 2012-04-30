var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = function (callback, to_load, target) {
    if (!target) {
        target = this;
    }

    if (!to_load) {
        if (this.path) {
            to_load = this.path;
        } else {
            throw new Error('no load path or root path present');
        }
    } else if (!this.path) {
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

    var readdir_done_cb = this.start_and_wdc('started loading directory ' + to_load);
    fs.readdir(to_load, function (err, files) {
        if (err) {
            throw err;
        }
        function _on_load_done() {
            function _after_load() {
                self.removeListener('after_load', _after_load);
                callback();
            }

            self.on('after_load', _after_load);
            self.emit('after_load');
            self.removeListener('load_done', _on_load_done);
        }

        self.on('load_done', _on_load_done);

        self.load(files, self.work_done_callback('done loading dir ' + to_load), to_load, target);

    })
}