var _ = require('underscore')
var _DEBUG = false;
module.exports = {

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

        if (_DEBUG) console.log('_route %s: method %s for ACTION %s', route, method, this.path);
        if (!method) {
            return [];
        } else if (!route) {
            //    var msg = util.format('no route for action %s', this.path);
            //    var msg = util.format('no route for action %s', this.path);
            route = this.heritage().replace(/:/g, '/').replace(/^app/, '');
            if (_DEBUG)  console.log('no route defined in config; forcing route to %s', route);
            //  return  cb( new Error(msg));
        } else {
            if (/^\*/.test(route)) {
                var prefix = this.get_config('route_prefix');
                route = route.replace(/^\*/, prefix);
            }
            if (_DEBUG)  console.log(' >>>>>>>>>>>>> transformed route to %s', route);
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

        if (_DEBUG) console.log('routing %s: %s for %s', route, method, this.path);
        if (!method) {
            var msg = util.format('no method for action %s', this.path);
            //console.log(msg);
            new Error(msg);
        } else if (!route) {
            //    var msg = util.format('no route for action %s', this.path);
            route = this.heritage().replace(/:/g, '/').replace(/^app/, '');
            if (_DEBUG)  console.log('no route defined in config; forcing route to %s', route);
            //  return  cb( new Error(msg));
        } else {
            if (/^\*/.test(route)) {
                var prefix = this.get_config('route_prefix');
                route = route.replace(/^\*/, prefix);
            }
            if (_DEBUG)  console.log(' >>>>>>>>>>>>> transformed route to %s', route);
        }

        server[method](route, function (req, res) {
            return self.respond(req, res);
        });
    }
}