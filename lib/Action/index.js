var util = require('util');
var _ = require('underscore');
var path = require('path');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var digest_res = require('./../utility/digest_res');
var file_finder = require('./../utility/file_finder');
var config_handler = require('./handlers/Config');
var action_handler = require('./handlers/Action');
var Req_State = require('./../Req_State');
var Loader = require('./../Loader');
var get_config = require('./../utility/get_config');
var Base = require('./../utility/Base');

var ensure_name = require('./../utility/ensure_name');
var _TELL_ROUTE = true;

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

_.extend(Action.prototype, Loader.prototype, {
    route:false,
    type:'',
    method:'get',
    CLASS:'ACTION',
    name:false,
    get_config: get_config,

    /* ********************* EVENTS ****************** */

    config_action:function () {
        var template = require('./templates/' + this.action_class);
        template.init(this);
    },

    extend:function (e) {
        // console.log('extending action with %s', util.inspect(e));
        _.extend(this, e);
    },

    on_load_done:function () {
        if (this.route === false) {
            this._make_route();
        }
    },

    _make_route:function () {
        var route_path = [this.controller.name, this.name];
        if (this.controller.parent.CLASS == 'COMPONENT') {
            route_path.unshift(this.controller.parent.name);
        }
        this.route = '/' + route_path.join('/');
        // console.log('making route for %s: %s', this.name, this.route);
    },

    /* ********************* SERVER ****************** */

    start_server:function (server, framework, cb) {
        var self = this;

        this.digest_res(framework.get_resources());
        this.framework = framework;

        //@TODO: handle multiple requiest type
        var method = this.method.toLowerCase();
        if (method == '*') {
            if (_TELL_ROUTE) console.log('MULTI METHOD!!!! %s', this.id());
            ['get', 'put', 'post', 'delete'].forEach(function (method) {
                if (self.config.hasOwnProperty(method + '_route')) {
                    var route = self.config[method + '_route'];
                    self._ss_route(server, method, route);
                }
            });
        } else {
            var route = this.config.hasOwnProperty(method + '_route') ? this.config[method + '_route'] : this.route;
            this._ss_route(server, method, route)
        }

        framework.log('action %s added route %s', this.name, this.route);

        cb();
    },

    _ss_route:function (server, method, route) {
        var self = this;
        if (_TELL_ROUTE) console.log('routing %s: %s for %s', route, method, this.path);
        if (!method) {
            var msg = util.format('no method for action %s', this.path);
            //console.log(msg);
            return  cb(new Error(msg));
        } else if (!route) {
        //    var msg = util.format('no route for action %s', this.path);
            route = this.heritage().replace(/:/g, '/').replace(/^app/, '');
            if (_TELL_ROUTE)  console.log(msg + ': forcing route to %s', route);
            //  return  cb( new Error(msg));
        }
        server[method](route, function (req, res) {
            return self.respond(req, res);
        });
    },

    /* ********************** NAME ******************* */

    heritage:function () {
        return this.controller.heritage() + ':' + this.name;
    },

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
      //    console.log('finding templtae based on path %s, name ', this.path, this.name);
        return file_finder(this.path, this._ptp_props, this.name);
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
        var method = rs.method().toLowerCase();
        switch (method) {
            case 'get':
                if (this.on_get_validate) {
                    return this.on_get_validate(rs);
                }
                break;

            case 'post':
                if (this.on_post_validate) {
                    return this.on_post_validate(rs);
                }
                break;

            case 'put':
                if (this.on_put_validate) {
                    return this.on_put_validate(rs);
                }
                break;


            case 'delete':
                if (this.on_delete_validate) {
                    return this.on_delete_validate(rs);
                }
                break;

        }

        this.on_validate(rs);
    },

    on_validate: function(rs){
        this.on_route(rs);
    },

    on_route:function (rs) {
        var method = rs.method().toLowerCase();
      //  console.log('routing %s', method);
        switch (method) {
            case 'get':
                if (this.on_get) {
                    return this.on_get(rs);
                }
                break;

            case 'post':
                if (this.on_post) {
                    return this.on_post(rs);
                }
                break;

            case 'put':
                if (this.on_put) {
                    return this.on_put(rs);
                }
                break;


            case 'delete':
                if (this.on_delete) {
                    return this.on_delete(rs);
                }
                break;

        }

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
         //  console.log('action: %s, template: %s', this.name, template);
        if (template) {
            rs.render(template, output);
        } else {
            rs.send(output);
        }
    },

    /* ***************** REPORTING ************* */

    to_JSON:function (switches) {
        out = this._JSON_report.call(this, switches);
        out.method = this.method;
        out.route = this.route;
        return out;
    }
});

module.exports = Action;