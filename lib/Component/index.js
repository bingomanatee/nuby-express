var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Path_Handler = require('./../Loader/Path_Handler');
var Controller = require('./../Controller');
var path = require('path');

var config_handler = require('./handler/Config.js');
var controller_handler = require('./handler/Controller');
var controller_dir_loader = require('./handler/Controller_dir');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Gate = require('node-support/gate');

/**
 * A "Component" is essentially a base balss for the abstract Loader class, designed for the
 * MVC environment. Note that the Framework is itself a component; that is, a simple
 * web application can consist of a single Component, that being the Framework.
 *
 * Components expand on the Express concept of Middleware, except where Middleware
 * is a narrow pipe within request/response handling, Components can include
 * a suite of middleware, static and utility resources and can share each others resources,
 * esp. in the case of models.
 *
 * @param config
 */

function Component(config) {
    Loader.call(this);
    this.controllers = [];
    digest_config(this, config);
    this._init_handlers();

}

util.inherits(Component, Loader);

_.extend(Component.prototype, {
    CLASS:'COMPONENT',
    heritage:heritage,

    can_load:function (load_path, type) {
        switch (type) {
            case 'file':
                return true;
                break;

            case 'dir':
                return true;
                break;

            default:
                return path.existsSync(load_path);
        }
    },

    /* ***************** SERVER ***************** */

    start_server:function (server, framework, cb) {
        var gate = new Gate(cb);
        this.controllers.forEach(function(action){
            action.start_server(server, framework, gate.task_done_callback());
        });
        gate.start();
    },

    /* **************** CONTROLLERS ************** */

    load_controller:function (con_path, cb) {
        var con = new Controller({path:con_path, parent:this});
        this.controllers.push(con);
        con.start_load(cb, con_path);
    },

    _init_handlers:function () {
        this.add_handler(config_handler());
        this.add_handler(controller_handler());
        this.add_handler(controller_dir_loader());

    },

    _load_dir_policy:'load',

    done_delay:1500, // milliseconds until done is emitted;

    /** ************* NAMES ********************* */

    name:function () {
        return  '<<component>>' + path.basename(this.path).replace(/^com(ponent)?_/, '');
    },

    controller_names:function () {
        return _.map(this.controllers, function (con) {
            return con.name();
        });
    },

    controller_heritage:function () {
        return _.map(this.controllers, function (con) {
            return con.heritage();
        });
    }

});

module.exports = Component;
