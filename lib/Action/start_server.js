var util = require('util');
var _ = require('underscore');
var path = require('path');
var _DEBUG_ROUTE = true;
var proper_path = require('support/proper_path');
var add_static_route = require('./../utility/add_static_route');

module.exports = {

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

    _public_paths:function (cb) {
        /**
         *  note - cannot use asyc methods here.
         */
        var root = this.path + '/public';

        // although it is discouraged because public directories are not the most effective way to host static files
        // each action can have a public directory that can host files as if they were in the framework's root public directory.
        // No guarantee is made for what happens if a path exists in both places!

        if (path.existsSync(root)) {
            add_static_route(root, this.name + '_action_public', '', this.frame);
        }
/*
        if (this.config.static) {
            var static = this.path + '/static';
            if (!path.existsSync(static)) {
                throw new Error('no static directory for action ' + this.path);
            }
            var self = this;
            this.config.static.forEach(function (def) {
                if (!/(\/)?static/.test(def.path)) {
                    def.path = '/static' + proper_path(def.path);
                }
                var static_path = self.relative_path() + proper_path(def.path, true);
                var prefix = def.prefix;
                //    console.log('adding static for action %s', util.inspect(self, false, 0));
                add_static_route(static_path, self.name + '_action_static_' + static_path, prefix, self.framework);
            });
        } */

        cb();
    },


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
}