var util = require('util');
var _ = require('underscore');
var Loader = require('./../Loader');
var path = require('path');
var Action = require('./../Action');
var action_handler = require('./handler/Action');
var action_dir_handler = require('./handler/Action_dir');
var config_handler = require('./handler/Config');

function Controller(config) {
    Loader.call(this, config);
    this.actions = [];
    this.config = {};
    this._init_controller_handlers();
}

util.inherits(Controller, Loader);

_.extend(Controller.prototype, {
    CLASS: 'CONTROLLER',

    _init_controller_handlers:function () {

        this.add_handler(action_handler);
        this.add_handler(action_dir_handler);
        this.add_handler(config_handler);
    },

    add_action: function(action_path, callback){
        this.actions.push(new Action({path: action_path}));
        callback(null, action_path);
    },

    name: function(){
        return '<<controller>>' + path.basename(this.path).replace(/^con(troller)?_/,'');
    },

    action_names: function(){
        return _.map(this.actions, function(action){
            return action.name();
        })
    }
});

module.exports = Controller;