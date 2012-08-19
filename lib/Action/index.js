var util = require('util');
var _ = require('underscore');
var path = require('path');
var digest_res = require('./../utility/digest_res');
var file_finder = require('./../utility/file_finder');
var config_handler = require('./handlers/Config');
var action_handler = require('./handlers/Action');
var Req_State = require('./../Req_State');
var Loader = require('./../Loader');
var get_config = require('./../utility/get_config');
var Base = require('./../utility/Base');
var proper_path = require('support/proper_path');

var ensure_name = require('./../utility/ensure_name');
var _flow = require('./flow');
var _start_server = require('./start_server');

function Action(config) {
    this.config = {};
    Loader.call(this);
    this.resources = {};
    this._init_handlers();
    _.extend(this, config);

    var self = this;
    ensure_name(this, /^(action_)?(.*)$/);
}

util.inherits(Action, Base);

var _val_errors = require('./validation');

/* ***************** CORE ************************* */

_.extend(Action.prototype, Loader.prototype);
_.extend(Action.prototype, _val_errors);
_.extend(Action.prototype, _flow);
_.extend(Action.prototype, _start_server);
_.extend(Action.prototype, {
    route:false,
    type:'',
    method:'get',
    CLASS:'ACTION',
    name:false,
    get_config:get_config,
    digest_res:digest_res,

    /* ********************* EVENTS ****************** */

    extend:function (e) {
        _.extend(this, e);
    },

    /* ********************* PUBLIC PATHS ************ */

    relative_path:function () {
        var l = this.framework.path.length;
        return this.path.substr(l);
    },

    /* *********************** HANDLERS ****************** */

    _init_handlers:function () {
        this.add_handler(config_handler());
        this.add_handler(action_handler());
    },

    respond:function (req, res) {
        //  console.log('responding: base');
        var rs = new Req_State(req, res, this, this.controller, this.framework);
        this.validate(rs);
    },

    /* ******************** VIEW  **************** */

    view_helpers:function () {
        return this.framework.get_resources('view_helper');
    },

    view_helper:function (name) {
        return this.framework.get_resource('view_helper', name);
    },

    _page_template:false,

    _ptp_props:[
        '%s/view.html',
        '%s/%s_view.html',
        '%s/view.xml',
        '%s/%s_view.xml',
        '%s/view.json',
        '%s/%s_view.json'
    ],

    page_template_path:function () {
        if (!this._page_template){
            this._page_template = file_finder(this.path, this._ptp_props, this.name);
        }
        return this._page_template;
    },

    dyn_template:function (template_str, template_props) {
        var dynamic_template = this.framework.make_view(template_str);
        if (template_props) {
            return dynamic_template(template_props);
        } else {
            return dynamic_template;
        }
    },

    /* ***************** REPORTING ************* */

    heritage:function () {
        return this.controller.heritage() + ':' + this.name;
    },

    to_JSON:function (switches) {
        out = this._JSON_report.call(this, switches);
        out.method = this.method;
        out.route = this.route;
        return out;
    },

    defaults:function (obj) {
        if (!obj) {
            return;
        }
        var addons = _.clone(obj);
        var self = this;
        _.each(addons, function (f) {
            if (_.isFunction(f)) {
                _.bind(f, self);
            }
        })
        _.defaults(this, addons);
    }
});

module.exports = Action;