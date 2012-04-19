var util = require('util');
var _ = require('underscore');
var path = require('path');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Loader = require('./../Loader');
var config_handler = require('./../utility/handler/Config');
var action_handler = require('./handler/Action');
var Simple = require('./templates/Simple');

function Action(config) {
    Loader.call(this);
    digest_config(this, config, true);
    this._init_handlers();
}

_.extend(Action.prototype, Loader.prototype, Simple.prototype, {
    route:'*',
    type:'',

    /* ********************* EVENTS ****************** */

    config_action:function () {
        var template = require('./templates/' + this.action_class);
        template.init(this);
    },

    extend:function (e) {
        _.extend(this, e);
    },

    /* ********************* SERVER ****************** */

    start_server:function (server, framework, cb) {
        //     console.log('logging action %s', this.name());
        framework.log('action %s added route %s', this.name(), this.route);
        //   console.log('starting server for action %s', this.heritage());
        cb();
    },

    /* ********************** NAME ******************* */

    _name : false,
    name:function (short) {
        var base = this._name ? this._name : path.basename(this.path);
        return short ? base : '<<action>>' + base.replace('action_', '');
    },
    heritage:heritage,

    /* *********************** HANDLERS ****************** */

    _init_handlers:function () {
        this.add_handler(
            config_handler(),
            action_handler()
        );
    }
});

module.exports = Action;