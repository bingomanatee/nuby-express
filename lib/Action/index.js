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
var add_static_route = require('./../utility/add_static_route');
var proper_path = require('support/proper_path');

var ensure_name = require('./../utility/ensure_name');
var _DEBUG_ROUTE = false;
var _flow = require('./flow');

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
_.extend(Action.prototype, {
    route:false,
    type:'',
    method:'get',
    CLASS:'ACTION',
    name:false,
    get_config:get_config,

    /* ********************* EVENTS ****************** */

    extend:function (e) {
        // console.log('extending action with %s', util.inspect(e));
        _.extend(this, e);
    },

    /* ********************* PUBLIC PATHS ************ */

    relative_path:function () {
        var l = this.framework.path.length;
        return this.path.substr(l);
    },

    _ppc:null,

    _public_paths:function (cb) {
        /**
         *  note - cannot use asyc methods here.
         */
        var root = this.path + '/public';

        if (path.existsSync(root)) {
            add_static_route(root, this.name + '_action_public', '', this.frame);
        }
        ;

        var self = this;
        var static = this.path + '/static';
        if (this.config.static) {
            if (!path.existsSync(static)) {
                throw new Error('no static directory for action ' + this.path);
            }
            this.config.static.forEach(function (def) {
                if (!/(\/)?static/.test(def.path)) {
                    def.path = '/static' + proper_path(def.path);
                }
                var static_path = self.relative_path() + proper_path(def.path, true);
                var prefix = def.prefix;
                //    console.log('adding static for action %s', util.inspect(self, false, 0));
                add_static_route(static_path, self.name + '_action_static_' + static_path, prefix, self.framework);
            });
        }

        cb();
    },

    /* ********************* SERVER ****************** */

    get_routes:function (by_method) {
        var out = []
        var self = this;

        var method = this.method.toLowerCase();
        if (method == '*') {
            if (_DEBUG_ROUTE) console.log('MULTI METHOD!!!! %s', this.id());
            ['get', 'put', 'post', 'delete'].forEach(function (method) {
                if (self.config.hasOwnProperty(method + '_route')) {
                    var route = self.config[method + '_route'];
                    var routes = self._route(method, route);
                    if (by_method) {
                        routes = _.map(routes, function (route) {
                            return {method:method, route:route};
                        })
                    }
                    out = out.concat(routes);
                }
            });
        } else {
            //    console.log('action: %s', util.inspect(this));
            var route = this.config.hasOwnProperty(method + '_route') ? this.config[method + '_route'] : this.route;
            route = this._route(method, route);

            if (by_method) {
                route = _.map(route, function (route) {
                    return {method:method, route:route};
                })
            }
            out = out.concat(route);
        }

        return out;
    },

    /**
     * note - ALWAYS returns an array.
     * @param method
     * @param route
     * @return {Array}
     * @private
     */
    _route:function (method, route) {
        var out = [];
        var self = this;

        if (_.isArray(route)) {
            route.forEach(function (r) {
                out = out.concat(self._route( method, r));
            })
            return out;
        }

        if (_DEBUG_ROUTE) console.log('_route %s: method %s for ACTION %s', route, method, this.path);
        if (!method) {
            return [];
        } else if (!route) {
            //    var msg = util.format('no route for action %s', this.path);
        //    var msg = util.format('no route for action %s', this.path);
            route = this.heritage().replace(/:/g, '/').replace(/^app/, '');
            if (_DEBUG_ROUTE)  console.log('no route defined in config; forcing route to %s', route);
            //  return  cb( new Error(msg));
        } else {
            if (/^\*/.test(route)) {
                var prefix = this.get_config('route_prefix');
                route = route.replace(/^\*/, prefix);
            }
            if (_DEBUG_ROUTE)  console.log(' >>>>>>>>>>>>> transformed route to %s', route);
        }

        return [route];
    },

    start_server:function (server, framework, cb) {
        var self = this;

        this.digest_res(framework.get_resources());
        this.framework = framework;

        //@TODO: handle multiple requiest type
        var method = this.method.toLowerCase();
        if (method == '*') {
            if (_DEBUG_ROUTE) console.log('MULTI METHOD!!!! %s', this.id());
            ['get', 'put', 'post', 'delete'].forEach(function (method) {
                if (self.config.hasOwnProperty(method + '_route')) {
                    var route = self.config[method + '_route'];
                    self._ss_route(server, method, route);
                }
            });
        } else {
            //    console.log('action: %s', util.inspect(this));
            var route = this.config.hasOwnProperty(method + '_route') ? this.config[method + '_route'] : this.route;
            this._ss_route(server, method, route)
        }

        framework.log('action %s added route %s', this.name, this.route);

        // console.log(' >>> ACTIONS - starting PUBLIC PATHS for %s', this.path);
        this._public_paths(cb);

    },

    _ss_route:function (server, method, route) {

        var self = this;

        if (_.isArray(route)) {
            route.forEach(function (r) {
                self._ss_route(server, method, r);
            })
            return;
        }

        if (_DEBUG_ROUTE) console.log('routing %s: %s for %s', route, method, this.path);
        if (!method) {
            var msg = util.format('no method for action %s', this.path);
            //console.log(msg);
            new Error(msg);
        } else if (!route) {
            //    var msg = util.format('no route for action %s', this.path);
            route = this.heritage().replace(/:/g, '/').replace(/^app/, '');
            if (_DEBUG_ROUTE)  console.log('no route defined in config; forcing route to %s', route);
            //  return  cb( new Error(msg));
        } else {
            if (/^\*/.test(route)) {
                var prefix = this.get_config('route_prefix');
                route = route.replace(/^\*/, prefix);
            }
            if (_DEBUG_ROUTE)  console.log(' >>>>>>>>>>>>> transformed route to %s', route);
        }

        server[method](route, function (req, res) {
            return self.respond(req, res);
        });
    },

    /* ********************** NAME ******************* */

    heritage:function () {
        return this.controller.heritage() + ':' + this.name;
    },

    /* ******************** VIEW HELPER PASSTHROUGHS **************** */

    view_helpers:function () {
        return this.framework.get_resources('view_helper');
    },

    view_helper:function (name) {
        return this.framework.get_resource('view_helper', name);
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

    /* ***************** REPORTING ************* */

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