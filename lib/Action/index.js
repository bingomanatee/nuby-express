var util = require('util');
var _ = require('underscore');
var path = require('path');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var digest_res = require('./../utility/digest_res');
var file_finder = require('./../utility/file_finder');
var config_handler = require('./handler/Config');
var action_handler = require('./handler/Action');
var Req_State = require('./../Req_State');
var Loader = require('./../Loader');

function Action(config) {
    this.config = {};
    Loader.call(this);
    this.resources = {};
    this._init_handlers();
    _.extend(this, config);
}

_.extend(Action.prototype, Loader.prototype, {
    route:'*',
    type:'',
    method:'get',
    CLASS:'ACTION',

    /* ********************* EVENTS ****************** */

    config_action:function () {
        var template = require('./templates/' + this.action_class);
        template.init(this);
    },

    extend:function (e) {
       // console.log('extending action with %s', util.inspect(e));
        _.extend(this, e);
    },

    /* ********************* SERVER ****************** */

    start_server:function (server, framework, cb) {
        this.digest_res(framework.get_resources());

        this.framework = framework;

        //@TODO: handle multiple requiest type
        var method = this.method.toLowerCase();
        var route = this.route;
        var self = this;
     //   console.log('routing %s: %s', route, method);
        server[method](route, function (req, res) {
            return self.respond(req, res);
        });

        framework.log('action %s added route %s', this.name(), this.route);

        cb();
    },

    /* ********************** NAME ******************* */

    _name:false,
    name:function (short) {
        var base = this._name ? this._name : path.basename(this.path);
        return short ? base : '<<action>>' + base.replace('action_', '');
    },
    heritage:heritage,

    /* ******************** RESOURCES **************** */

    digest_res:digest_res,

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

    /* *************** VIEW TEMPLATE ***************** */

    _page_template:false,

    /**
     * returns either the teplate FUNCTION(if no props passed) or a string produced by the template (if props passed).
     * If the template varies by context, overwrite this method and use the rs to calculate the response.
     *
     * @param rs: Req_State
     * @param template_props
     */
    page_template:function (rs, template_props) {
        if (_.isString(rs)) {
            return this.dyn_template(rs, template_props);
        }

        if (!this._page_template) {
            this._page_template = this.framework.make_view(this.page_template_path());
        }

        return template_props ? this._page_template(template_props) : this._page_template;
    },

    _ptp_props:[
        '%s/view.html',
        '%s/%s_view.html',
        '%s/view.xml',
        '%s/%s_view.xml',
        '%s/view.json',
        '%s/%s_view.json'
    ],

    page_template_path:function () {
        //  console.log('finding templtae based on path %s, name ', this.path, this.name(true));
        return file_finder(this.path, this._ptp_props, this.name(true));
    },

    dyn_template:function (template_str, template_props) {
        var dynamic_template = this.framework.make_view(template_str);
        if (template_props) {
            return dynamic_template(template_props);
        } else {
            return dynamic_template;
        }
    },

    /* *************** RESPONSE METHODS ************** */

    validate:function (rs) {
        this.on_route(rs);
    },

    on_route:function (rs) {
        var method = rs.method().toUpperCase();

        switch (method) {
            case 'get':
                if (this.hasOwnProperty('on_get')) {
                    return this.on_get(rs);
                }
                break;

            case 'post':
                if (this.hasOwnProperty('on_post')) {
                    return this.on_post(rs);
                }
                break;

            case 'put':
                if (this.hasOwnProperty('on_put')) {
                    return this.on_put(rs);
                }
                break;


            case 'delete':
                if (this.hasOwnProperty('on_delete')) {
                    return this.on_delete(rs);
                }
                break;

        }

        this.on_respond(rs);
    },

    on_respond:function (rs) {
     //   console.log('responding with %s', this.path);
        this.on_input(rs);
    },

    on_input:function (rs) {
        this.on_process(rs, rs.req_props);
    },

    on_process:function (rs, input) {
        this.on_output(rs, input);
    },

    on_output:function (rs, output) {
        var template = this.page_template_path();
    //    console.log('action: %s, template: %s', this.name(), template);
        if (template) {
            rs.render(template, output);
        } else {
            rs.send(output);
        }
    }
});

module.exports = Action;