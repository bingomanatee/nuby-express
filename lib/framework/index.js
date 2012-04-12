var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Component = require('./../Component');
var path = require('path');

/**
 * The Framework is a singleton that coordinates the entire application.
 * As an EventEmitter, it can handle asynchronous messaging for a variety of
 * (future) functionality.
 *
 * Its primary role is to serve as an Express server - however, its design is
 * open enough to serve other purposes.
 *
 * A Frameworks primary purpose is to allow the loading and exeuction of one
 * or more Components.
 *
 * @param config
 */

function Framework(config) {
    this.paths = [];
    _.extend(this, config);
    this.components = [];
}

util.inherits(Framework, Loader);

_.extend(Framework.prototype, {

    can_load:function (load_path, type) {
        switch (type) {
            case 'file':
                return false;
                break;

            case 'dir':
                return true;
                break;

            default:
                return path.existsSync(load_path);
        }
    },

    load_file:function (file) {
        console.log(' WHY AM I HERE? (ignoring) file: %s', file);
        //this.paths.push(file);
        this.emit('work_done', file);
    },

    load_dir:function (dir) {
        console.log('framework: directory : %s', dir);
        //this.paths.push(file);
        var self = this;
        var c = new Component({framework: this});
        this.components.push(c);
        c.start_load(function () {
            self.emit('work_done', util.inspect('component loaded: %s', dir));
        }, dir);
    },

    _load_dir_policy:'load',

    done_delay:1500 // milliseconds until done is emitted;

});

module.exports = Framework;
