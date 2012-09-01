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
var Gate = require('support/gate');
var ensure_name = require('./../utility/ensure_name');

var _config_user = require('./../utility/config_user');

var _DEBUG = false;

var async = require('async');

function Controller(config) {
    Loader.call(this, config);
    this._actions = [];
    this._resources = [];
    this._init_handlers();
    ensure_name(this, /^con(troller)?_(.*)$/);
}

util.inherits(Controller, Loader);
_.extend(Controller.prototype, _config_user);
_.extend(Controller.prototype, Loader.prototype, {
    CLASS:'CONTROLLER',
    heritage:heritage,

    /* ************* LOADING ****************** */

    _init_handlers:function () {

        this.add_handler(action_handler());
        this.add_handler(action_dir_handler());
        this.add_handler(config_handler({name:'con_config_handler'}));
        this.add_handler(ress_handler());
    },

    /* ***************** _actions **************** */

    add_action:function (action_path, callback, frame) {
        var action = new Action({path:action_path,
            parent:this, controller:this, framework:frame});
        this._actions.push(action);
        if (this.action_template){
           action.defaults(this.action_template);
        }
        if (this.parent && this.parent.action_template){
            action.defaults( this.parent.action_template);
        }
        action.start_load(callback, action_path, frame, action);
    },

    get_actions: function(){
      return this._actions.slice(0);
    },

    /* ***************** SERVER ***************** */

    start_server:function (server, framework, cb) {
        if (_DEBUG) console.log('start server for CONTROLLER: %s, FRAME %s', this.path, framework.path);
        var gate = new Gate(cb, 'start_server for CONTROLLER ' + this.path +', actions: ', + this._actions.length);
      //  gate.debug = true;

        this._actions.forEach(function (action) {
            gate.task_start('ss: action ' + action.path);
            action.start_server(server, framework, function(){
                gate.task_done('ss: action ' + action.path);
            });
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