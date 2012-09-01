var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Path_Handler = require('./../Loader/Path_Handler');
var Controller = require('./../Controller');
var path = require('path');
var handlers = require('./../handlers');

var config_handler = require('./../handlers/Config');
var ress_handler = require('./../handlers/Resources');
var controller_handler = require('./handlers/Controller');
var controller_dir_loader = require('./handlers/Controller_dir');

var heritage = require('./../utility/heritage');
var Gate = require('support/gate');
var log = require('./../utility/log');
var ensure_name = require('./../utility/ensure_name');
var _config_user = require('./../utility/config_user');
var async = require('async');

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
    this._controllers = [];
    this._resources = [];
    _.extend(this, config);
    this._init_handlers();
    ensure_name(this, /^(com(ponent)?)?_(.*)/);
}

util.inherits(Component, Loader);
_.extend(Component.prototype, _config_user);

_.extend(Component.prototype, {
    CLASS:'COMPONENT',
    heritage:heritage,
    log:log,

    actions: function(){
      var a = [];

        this._controllers.forEach(function(c){

            a = a.concat(c.actions());

        })

        return a;
    },

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

    start_server:function (server, frame, callback) {

        var gate = new Gate(callback, 'start_server ' + this.path);

        this._controllers.forEach(function (com) {
            com.start_server(server, frame, gate.task_done_callback(true));
        });

        gate.start();
    },

    /* **************** CONTROLLERS ************** */

    load_controller:function (con_path, cb, frame) {
        // console.log('loading controller %s', con_path);
        var con = new Controller({path:con_path, parent:this});
        con.parent = this;
        this._controllers.push(con);
        //    console.log('component: loading controller %s into %s; %s controllers', con_path, this.id(), this._controllers.length);
        con.start_load(cb, con_path, frame, con);
    },

    _init_handlers:function () {
        this.add_handler(config_handler());
        this.add_handler(controller_handler());
        this.add_handler(controller_dir_loader());
        this.add_handler(ress_handler());
        this.add_handler(handlers.Components());
        this.add_handler(handlers.Component());

    },

    get_controllers:function () {
        if (!this._controllers || (!_.isArray(this._controllers))){
            return [];
        }
        return this._controllers.slice(0);
    },

    get_actions: function(){
        var actions = [];
        this._controllers.forEach(function(c){
            actions = actions.concat(c.get_actions());
        })
        return actions;
    },

    _load_dir_policy:'load',

    done_delay:1500, // milliseconds until done is emitted;

    /** ************* NAMES ********************* */

    controller_names:function () {
        return _.map(this._controllers, function (con) {
            return con.name;
        });
    },

    controller_heritage:function () {
        return _.map(this._controllers, function (con) {
            return con.heritage();
        });
    },

    /* ******* RESOURCES ********************** */

    import_child_resources:function () {
        //  console.log(']]]]]]]]]] importing child resources for %s', this.id());
        var self = this;
        this._controllers.forEach(function (con) {
            var com_res = con.get_resources();
            //console.log(']]]]]]]]]]]]]]] importing controller resources %s to %s', util.inspect(com_res), self.id());
            self._resources = self._resources.concat(com_res);
        });

        if (this.components && _.isArray(this.components)) {
            this.components.forEach(function (com) {
                com.import_child_resources();
                var com_res = com.get_resources();
                //  console.log(']]]]]]]]]] importing component resources %s to %s', util.inspect(com_res), self.id());
                self._resources = self._resources.concat(com_res);
            })
        }
    },

    /* ***************** REPORTING ************* */

    to_JSON:function (switches) {
        var out = Loader.prototype.to_JSON.call(this, switches);
        var com_switches = {};

        function _to_json(i) {
            if (!i) return false;
            return i.to_JSON(switches);
        }

        function _is_false(prop) {
            if (switches) {
                if (switches.hasOwnProperty(prop)) {
                    if (!switches[prop]) {
                        return true;
                    }
                }
            }
            return false;
        }

        if (!_is_false('controllers')) {
            out.controllers = _.map(this._controllers, _to_json);
        }

        if (!_is_false('components')) {
            out.components = _.map(this.components, _to_json);
        }

        return out;
    }

});

module.exports = Component;
