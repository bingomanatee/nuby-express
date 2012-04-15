var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var path = require('path');

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
        console.log('"adding" action %s', action_path);
        this.actions.push(action_path);
        callback(null, action_path);
    },

    name: function(){
        return '<<controller>>' + path.basename(this.path).replace(/^con(troller)?_/,'');
    }
});

module.exports = Controller;