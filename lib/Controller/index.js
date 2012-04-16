var util = require('util');
var _ = require('underscore');
var Loader = require('./../Loader');
var path = require('path');
var Action = require('./../Action');
var action_handler = require('./handler/Action');
var action_dir_handler = require('./handler/Action_dir');
var config_handler = require('./handler/Config');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Gate = require('node-support/gate');

function Controller(config) {
    this.actions = [];
    digest_config(this, config);

    this._init_controller_handlers();
}

util.inherits(Controller, Loader);

_.extend(Controller.prototype, {
    CLASS:'CONTROLLER',
    heritage:heritage,

    /* ************* LOADING ****************** */

    _init_controller_handlers:function () {

        this.add_handler(action_handler());
        this.add_handler(action_dir_handler());
        this.add_handler(config_handler());
    },

    /* ***************** ACTIONS **************** */

    add_action:function (action_path, callback) {
        this.actions.push(new Action({path:action_path, parent: this}));
        callback(null, action_path);
    },

    /* ***************** SERVER ***************** */

    start_server:function (server, framework, cb) {
        var gate = new Gate(cb);
        this.actions.forEach(function(action){
            action.start_server(server, framework, gate.task_done_callback());
        });
        gate.start();
    },

    /* ************* NAMES ************** */

    name:function () {
        return '<<controller>>' + path.basename(this.path).replace(/^con(troller)?_/, '');
    },

    action_names:function () {
        return _.map(this.actions, function (action) {
            return action.name();
        })
    }
});

module.exports = Controller;