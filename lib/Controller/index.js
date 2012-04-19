var util = require('util');
var _ = require('underscore');
var Loader = require('./../Loader');
var path = require('path');
var Action = require('./../Action');
var action_handler = require('./handler/Action');
var action_dir_handler = require('./handler/Action_dir');
var config_handler = require('./../utility/handler/Config');
var ress_handler = require('./../utility/handler/resources');
var res_handler = require('./../utility/handler/resource');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Gate = require('node-support/gate');

function Controller(config) {
    this.actions = [];
    digest_config(this, config, true);
    this._init_handlers();
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
        this.add_handler(res_handler());
    },

    /* ***************** ACTIONS **************** */

    add_action:function (action_path, callback, target) {
        var action = new Action({path:action_path, parent:this, controller:this, framework:target});
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

    name:function (short) {
        var base = path.basename(this.path).replace(/^con(troller)?_/, '');
        return (short) ? base : '<<controller>>' + base;
    },

    action_names:function () {
        return _.map(this.actions, function (action) {
            return action.name();
        })
    }
});

module.exports = Controller;