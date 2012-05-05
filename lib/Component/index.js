var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Path_Handler = require('./../Loader/Path_Handler');
var Controller = require('./../Controller');
var path = require('path');

var config_handler = require('./../handlers/Config');
var ress_handler = require('./../handlers/Resources');
var controller_handler = require('./handlers/Controller');
var controller_dir_loader = require('./handlers/Controller_dir');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Gate = require('support/gate');
var log = require('./../utility/log');
var ensure_name = require('./../utility/ensure_name');
var get_config = require('./../utility/get_config');
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

_.extend(Component.prototype, {
    CLASS:'COMPONENT',
    heritage:heritage,
    log:log,
    get_config:get_config,

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

        var gate = new Gate(callback);

        self.components.forEach(function (com) {
            com.start_server(server, frame, gate.task_done_callback(true));

        });
        self._controllers.forEach(function (com) {
            com.start_server(server, frame, gate.task_done_callback(true));
        });

        gate.start();

    },

    /* **************** CONTROLLERS ************** */

    load_controller:function (con_path, cb) {
        var con = new Controller({path:con_path, parent:this});
        this._controllers.push(con);
    //    console.log('component: loading controller %s into %s; %s controllers', con_path, this.id(), this._controllers.length);
        con.start_load(cb, con_path);
    },

    _init_handlers:function () {
        this.add_handler(config_handler());
        this.add_handler(controller_handler());
        this.add_handler(controller_dir_loader());
        this.add_handler(ress_handler());

    },

    _load_dir_policy:'load',

    done_delay:1500, // milliseconds until done is emitted;

    /** ************* NAMES ********************* */

    controller_names:function () {
        console.log('%s CN length: %s', this.id(), this._controllers.length);
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
        var self = this;
        this._controllers.forEach(function (con) {
            self._resources = self._resources.concat(con.get_resources());
        });
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
