var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Path_Handler = require('./../Loader/Path_Handler');
var Controller = require('./../Controller');
var path = require('path');

var config_handler = require('./../utility/handler/Config.js');
var ress_handler = require('./../utility/handler/resources');
var res_handler = require('./../utility/handler/resource');

var controller_handler = require('./handler/Controller');
var controller_dir_loader = require('./handler/Controller_dir');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Gate = require('node-support/gate');
var log = require('./../utility/log');
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
    this.controllers = [];
    digest_config(this, config, true);
    this._init_handlers();

}

util.inherits(Component, Loader);

_.extend(Component.prototype, {
    CLASS:'COMPONENT',
    heritage:heritage,
    log:log,

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
        this.controllers.forEach(function (action) {
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
        this.add_handler(ress_handler());
        this.add_handler(res_handler());

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
    },

    add_resource:function (res) {
        if (!this._resources) {
            this._resources = [];
        }
        this._resources.push(res);
    },

    get_resources:function (type, name) {
        if (!this._resources) {
            return [];
        }
        if ((!type) && (!name)){
            return this._resources.slice(0);
        }

        return _.filter(this._resources, function(r){
           if (type && r.type !== type){
               return false;
           }
            if (name && r.name(true) != name){
                return false;
            }
            return true;
        });
    },

    get_resource:function (type, name) {
        var a = this.get_resources(type, name);
        if (a.length > 1) {
            throw new Error(util.format("ambiguous get_resource query: %s, %s", type, name));
        } else if (a.length <= 0) {
            throw new Error(util.format("cannot find get_resource query: %s, %s", type, name));
        }
        else {
            return a[0];
        }
    },

    _resources:false

});

module.exports = Component;
