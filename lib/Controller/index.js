var util = require('util');
var _ = require('underscore');
var Loader = require('./../Loader');
var path = require('path');
var Action = require('./../Action');
var action_handler = require('./handlers/Action');
var action_dir_handler = require('./handlers/Action_dir');
var config_handler = require('./../handlers/Config');
var ress_handler = require('./../handlers/Resources');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Gate = require('support/gate');
var ensure_name = require('./../utility/ensure_name');
var get_config = require('./../utility/get_config');
var async = require('async');

function Controller(config) {
    Loader.call(this, config);
    this._actions = [];
    this._resources = [];
    this._init_handlers();
    ensure_name(this, /^con(troller)?_(.*)$/);
}

util.inherits(Controller, Loader);

_.extend(Controller.prototype, Loader.prototype, {
    CLASS:'CONTROLLER',
    heritage:heritage,
    get_config:get_config,

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
            return name;
        }
    },

    /* ***************** _actions **************** */

    add_action:function (action_path, callback, frame) {
        var action = new Action({path:action_path,
            parent:this, controller:this, framework:frame});
        this._actions.push(action);
        action.start_load(callback, action_path, frame);
    },

    /* ***************** SERVER ***************** */

    start_server:function (server, framework, cb) {
     //   console.log('start server for controller: %s', util.inspect(this, true, 1));
        var gate = new Gate(cb);

        this._actions.forEach(function (action) {
            action.start_server(server, framework, gate.task_done_callback(true));
        });
        gate.start();
    },

    /* ************* NAMES ************** */

    action_names:function () {
        return _.map(this._actions, function (action) {
            return action.name;
        })
    },

    /* ***************** REPORTING ************* */

    to_JSON:function (switches) {
        var out = Loader.prototype.to_JSON.call(this, switches);
        delete out.controller;

        function _to_json(i) {
            return i.to_JSON(switches);
        }

        out.actions = _.map(this._actions, _to_json);

        return out;
    }

});

module.exports = Controller;