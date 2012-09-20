var util = require('util');
var _ = require('underscore');
var handlers = require('./../handlers');
var Component = require('./../Component');
var con_handler = require('./../Component/handlers/Controller');
var controller_dir_loader = require('./../Component/handlers/Controller_dir');
var ress_handler = require('./../handlers/Resources');
var path = require('path');
var log = require('./../utility/log');
var _DEBUG = false;
/**
 * The Framework is a singleton that coordinates the entire application.
 * As an EventEmitter, it can handle asynchronous messaging for a variety of
 * functionality.
 *
 * A Frameworks primary purpose is to allow the loading and exeuction of one or more Components,
 * as well as being a fundamental library of all shared resources.
 * This includes the governing Express server.
 *
 * Note that Framework extends Component so any abilities of a Component
 * apply to a framework.
 *
 * @param config
 */

function Framework(config) {
    this.components = [];
    this._resources = [];
    this._log = [];
    this.config = {port:80};
    Component.call(this, config);
}

util.inherits(Framework, Component);

_.extend(Framework.prototype, {

    CLASS:'FRAMEWORK',

    /* ************** LOGGING *********************** */

    log:log,
    log_report:log.report,
    _log:false,

    /* ************** LOADING *********************** */

    _init_handlers:function () {
        this.add_handler(con_handler());
        this.add_handler(controller_dir_loader());
        this.add_handler(handlers.Components());
        this.add_handler(handlers.Component());
        this.add_handler(handlers.Config({name:'framework_config_handler', re:/frame(work)?_((.*)_)?config.json/i}));
        this.add_handler(ress_handler());
    },

    load_component:function (com_path, cb) {
        if (_DEBUG)  console.log('FRAMEWORK loading component %s', com_path);
        var com = new Component({path:com_path, parent:this});
        com.parent = this;
        this.components.push(com);
        com.start_load(cb, com_path, this);
    },

    /* ******************* SERVER START **************** */

    _server:null,

    server:function () {
        return this._server;
    },

    start_server:require('./start_server'),

    /* ***************** PUBLIC PATH ******************* */

    /**
     * returns all possible full paths based on stored static_routes.
     * NOTE: it does NOT guarantee that the static resource EXISTS -
     * only where it would be based on the static route.
     * @param pathname
     * @return {*}
     */

    public_paths:require('./public_paths'),

    /* ***************** RESOURCES ******************* */

    import_child_resources:function () {
        var self = this;
        this.get_controllers().forEach(function (con) {
            self._resources = self._resources.concat(con.get_resources());
        });
        this.get_components().forEach(function (con) {
            con.import_child_resources();
            self._resources = self._resources.concat(con.get_resources());
        });
    },

    /* ****************** CONTROLLER ********************* */

    controller_names:function (include_components) {

        var cn = _.map(this._controllers, function (c) {
            if (c) {
                return c.name
            } else {
                console.log('empty controller item')
            }
        });

        //  console.log('RCN of %s: [%s]', this.name(), cn.join(','));
        if (include_components) {
            var ccn = this.com_controller_names();
            //   console.log('CCN: [%s]', ccn.join(','));
            return cn.concat(ccn);
        }

        return cn;
    },

    com_controller_names:function () {
        return _.flatten(_.map(this.components, function (com) {
            return com.controller_names();
        }));
    },

    frame_controllers:function () {
        var con = [this.get_controllers()]; // any direct controllers;
        con = con.concat(_.map(this.get_components(), function (com) {
            return com.get_controllers();
        }));
        return _.flatten(con);
    },

    name:'app',

    controller_heritage:function (include_com) {
        var ch = _.map(this._controllers, function (c) {
            return c.heritage();
        });

        if (include_com) {
            return ch.concat(this.com_controller_heritage());
        }

        return ch;
    },

    com_controller_heritage:function () {
        return _.flatten(_.map(this.components, function (com) {
            return com.controller_heritage();
        }));
    },

    get_components:function () {
        if (!this.components || (!_.isArray(this.components))) {
            return [];
        }
        return this.components.slice(0);
    },

    actions:function () {
        var actions = [];
        this._controllers.forEach(function (c) {
            actions = actions.concat(c.get_actions());
        })

        this.components.forEach(function (co) {
            actions = actions.concat(co.get_actions());
        })

        return actions;
    }
});

module.exports = Framework;
