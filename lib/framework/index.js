var util = require('util');
var _ = require('underscore');
var Component = require('./../Component');
var coms_handler = require('./handler/Components');
var com_handler = require('./handler/Component');
var config_handler = require('./../utility/handler/Config');
var con_handler = require('./../Component/handler/Controller');
var controller_dir_loader = require('./../Component/handler/Controller_dir');
var ress_handler = require('./../utility/handler/resources');
var path = require('path');
var Gate = require('support/gate');
var log = require('./../utility/log');

var _DEBUG = false;
/**
 * The Framework is a singleton that coordinates the entire application.
 * As an EventEmitter, it can handle asynchronous messaging for a variety of
 * (future) functionality.
 *
 * Its primary role is to serve as an Express server - however, its design is
 * open enough to serve other purposes.
 *
 * A Frameworks primary purpose is to allow the loading and exeuction of one or more Components,
 * as well as directly containing core controllers, models and views.
 *
 * Note that Framework extends Component so any resources that can be stored in a Component
 * can be stored in a framework.
 *
 * A straighforward MVC app might have all its contents in an 'app' directory
 * Inside an App can be both controllers and components (see).
 *
 * @param config
 */

function Framework(config) {
    this.components = [];
    this.controllers = [];
    this._resources = [];
    this._log = [];
    this.config = {port: 80};
    Component.call(this, config);
}

//util.inherits(Framework, Component);

_.extend(Framework.prototype, Component.prototype, {

    CLASS:'FRAMEWORK',

    /* ************** LOGGING *********************** */

    log:log,
    log_report:log.report,
    _log:false,

    /* ************** LOADING *********************** */

    _init_handlers:function () {
        this.add_handler(con_handler());
        this.add_handler(controller_dir_loader());
        this.add_handler(coms_handler());
        this.add_handler(com_handler());
        this.add_handler(config_handler({name:'framework_config_handler', re:/frame(work)?_((.*)_)?config.json/i}));
        this.add_handler(ress_handler());
    },

    load_component:function (com_path, cb) {
        if (_DEBUG)  console.log('FRAMEWORK loading component %s', com_path);
        var com = new Component({path:com_path, parent:this});
        this.components.push(com);
        com.start_load(cb, com_path, this);
    },

    /* ******************* SERVER START **************** */

    _server:null,

    server: function(){
        return this._server;
    },

    start_server:function (callback) {
        this._server = require('express').createServer();
        this._server_work = 0;
        this._server_started = false;

        var self = this;
        var gate = new Gate(callback);

        this.import_child_resources();

        var mixins = this.get_resources('mixin');
        mixins.forEach(function (ehr) {
            ehr.apply(self, gate.task_done_callback(true));
        })

        var eh = this.get_resources('express_helper');
        eh.forEach(function (ehr) {
         //   console.log('applying to %s', util.inspect(ehr));
            ehr.apply(self._server, self, gate.task_done_callback(true));
        })

        this.components.concat(this.controllers).forEach(function (c) {
            c.start_server(self._server, self, gate.task_done_callback(true));

        })
        gate.start();
    },

    _server_work:0,
    _ss_int:false,
    _server_started:false,

    _sis:function () {
        ++this._server_work;
        console.log('%s server actions >>', this._server_work);
        if (this._ss_int) {
            clearInterval(this._ss_int);
        }
    },

    _sid:function (msg) {
        if (this._server_started) {
            throw new Error('WARNING - server started prematurely! ' + msg);
        }

        console.log('%s server actions <<', this._server_work);

        --this._server_work;
        if (this._server_work <= 0) {
            if (!this._ss_int) {
                this._ss_int = setInterval(function () {
                    this._sid_check();
                }, this._sid_tick);
            }
        }
    },

    _sid_check:function () {
        if (this._server_work <= 0) {
            this._start_server();
        }
    },

    _sid_tick:800,

    /* ***************** RESOURCES ******************* */

    import_child_resources:function () {
        var self = this;
        this.controllers.forEach(function (con) {
            self._resources = self._resources.concat(con.get_resources());
        });
        this.components.forEach(function (con) {
            con.import_child_resources();
            self._resources = self._resources.concat(con.get_resources());
        });
    },

    /* ****************** NAMES ********************* */

    controller_names:function (include_components) {
        //  console.log('FW controllers: %s', this.controllers.length);
        this.components.forEach(function (com) {
            //   console.log('COM %s controllers: %s', comname, com.controllers.length);
        })
        var cn = _.map(this.controllers, function (c) {
            return c.name
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

    name: 'app',

    controller_heritage:function (include_com) {
        var ch = _.map(this.controllers, function (c) {
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
    }
});

module.exports = Framework;
