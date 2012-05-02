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
    get_config: get_config,

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

    add_action:function (action_path, callback, frame) {
        var action = new Action({path:action_path,
            parent:this, controller:this, framework:frame});
        this.actions.push(action);
        action.start_load(callback, action_path, frame);
    },

    /* ***************** SERVER ***************** */

    start_server:function (server, framework, cb) {

        var action_tasks = [];
        this.actions.forEach(function (action) {
            action_tasks.push(function(callback){
                action.start_server(server, framework, callback);
            })
        });
        async.parallel(action_tasks, cb);
    },

    /* ************* NAMES ************** */

    action_names:function () {
        return _.map(this.actions, function (action) {
            return action.name;
        })
    }

});

module.exports = Controller;