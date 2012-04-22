var util = require('util');
var _ = require('underscore');
var Loader = require('./../Loader');
var path = require('path');
var Action = require('./../Action');
var action_handler = require('./handler/Action');
var action_dir_handler = require('./handler/Action_dir');
var config_handler = require('./../utility/handler/Config');
var ress_handler = require('./../utility/handler/resources');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Gate = require('support/gate');
var ensure_name = require('./../utility/ensure_name');

function Controller(config) {
    this.actions = [];
    this._resources = [];
    digest_config(this, config, true);
    this._init_handlers();
    var self = this;
    ensure_name(this, /^con(troller)?_(.*)$/);
}

util.inherits(Controller, Loader);

_.extend(Controller.prototype, {
    CLASS:'CONTROLLER',
    heritage:heritage,

    /* ************* LOADING ****************** */

    _init_handlers:function () {

        this.add_handler(action_handler());
        this.add_handler(action_dir_handler());
        this.add_handler(config_handler({name:'con_config_handler'}));
        this.add_handler(ress_handler());
    },

    on_load_done:function () {
        if (!this.name) {
            var name = path.basename(this.path, 'js');
            var m = /^con(troller)?_(.*)$/.exec(name);
            if (m) {
                name = m[m.length - 1];
            }
            this._name = name;
            console.log('defining name of controller %s', name);
            return name;
        }
    },

    /* ***************** ACTIONS **************** */

    add_action:function (action_path, callback, target) {
        var action = new Action({path:action_path,
            parent:this, controller:this, framework:target});
        this.actions.push(action);
        action.start_load(callback, action_path, target);
    },

    /* ***************** SERVER ***************** */

    start_server:function (server, framework, cb) {
        var gate = new Gate(cb);
        this.actions.forEach(function (action) {
            action.start_server(server, framework, gate.task_done_callback());
        });
        gate.start();
    },

    /* ************* NAMES ************** */

    action_names:function () {
        return _.map(this.actions, function (action) {
            return action.name;
        })
    },

    /* ******* RESOURCES ********************** */

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
        if ((!type) && (!name)) {
            return this._resources.slice(0);
        }

        return _.filter(this._resources, function (r) {
            if (type && r.type !== type) {
                return false;
            }
            if (name && r.name != name) {
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

module.exports = Controller;