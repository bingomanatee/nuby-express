var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var proper_path = require('support/proper_path');
var path = require('path');
var _DEBUG = false;

/* ***************** CLOSURE ************* */

function _default_public_static_route() {
    return {
        'prefix':'',
        'root':'/public'
    }
}

/* ***************** MODULE *********** */

module.exports = function (pathname) {
    var paths = [];
    var self = this;
    var path_suffix = proper_path(pathname);

    if (_DEBUG) {
        console.log(' ------------------------- \n LOOKING FOR PATH: %s', pathname)
    }
    var static_routes = this.get_resources('static_route').concat(_default_public_static_route.call(this));

    if (_DEBUG) {
        console.log("STATIC ROUTES: %s", util.inspect(static_routes));
    }
    var possible_paths = _.map(static_routes, function (route) {
        var route_prefix = proper_path(route.prefix);
  //      console.log('Pathname: %s, proper_path: %s', pathname, path_suffix);
        var path_suffix_prefix = path_suffix.substr(0, route_prefix.length);

        if (path_suffix_prefix != route_prefix) {
         if (_DEBUG)  console.log('route_prefix: %s, path_suffix_prefix: %s; returning false ', route_prefix, path_suffix_prefix);
            return false;
        }

        var clipped_suffix = proper_path(path_suffix.substr(route_prefix.length));

        var root = proper_path(self.path) + proper_path(route.root);

      //  console.log('looking for suffix %s in %s', clipped_suffix, root);

        return {
            full_path:path.normalize(root + clipped_suffix),
            rank:route_prefix.length * -1
        }

    });
    if (_DEBUG) console.log('static routes: %s', util.inspect(possible_paths));

    var out = _.sortBy(_.filter(possible_paths, _.identity), function (data) {
        return data.rank;
    });
   // console.log('candidates = %s', util.inspect(out));
    return out;
}