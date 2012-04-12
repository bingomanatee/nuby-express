var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Component = require('./../Component');
var path = require('path');

/**
 * A "Component" is a loading element for anything that configures the
 * framework: you can have components for setting up the session,
 * for user management, for adding jQuery to your public folder, etc.
 *
 * Components expand on the Express concept of Middleware, except where Middleware
 * is a narrow pipe within request/response handling, Components can include
 * a suite of middleware, static and utility resources and can share each others resources,
 * esp. in the case of models.
 *
 * @param config
 */

function Component(config) {
    this.paths = [];
    _.extend(this, config);
    this.components = [];
}

util.inherits(Component, Loader);

_.extend(Component.prototype, {
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
        console.log('Component: directory : %s', dir);
        //this.paths.push(file);
        var self = this;
        var c = new Component(dir);
        this.components.push(c);
        c.start_load(function () {
            self.emit('work_done', util.inspect('component loaded: %s', dir));
        }, dir);
    },

    _load_dir_policy:'load',

    done_delay:1500 // milliseconds until done is emitted;

});

module.exports = Component;
