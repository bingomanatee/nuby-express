var _ = require('../../node_modules/underscore');
var util = require('util');

/**
 * Gets a parameter.
 *
 * @param what: String || array of strings.
 * @param callback a function to recieve the value requested; has a single argument.
 * @param absent: function || value. if function, executes if the value is not set.
 */

module.exports = function (params, req_state, what, callback, absent) {

   //console.log('GET PARAM getting ', (_.isArray(what)) ? what.join(', ') : what, ', callback = ', typeof callback == 'function' ? callback.toString() : util.inspect(callback));

    if (!_.isFunction(callback)) {
        throw new Error('getparam: non callback passed as callback: ' + util.inspect(callback));
    }

    function _if_absent() {
        if (typeof absent == 'function') {
        //    console.log('GET PARAM: absent = %s', absent.toString());
            return absent();
        } else {
            return callback(null, absent);
         //   console.log('GET PARAM: absent = %s', util.inspect(absent));
        }
    }

    if (_.isArray(what)) {
        var target = params;
        for (var i = 0; i < what.length; ++i) {
            if (_.isArray(target)) {
                if (target.length >= what[i]) {
                    return _if_absent();
                } else {
                    target = target[what[i]];
                }
            } else if (typeof (target) == 'function') {
                var arg;
                if (i < (what.length - 1)) {
                    arg = what.slice(i + 1);
                } else {
                    arg = [];
                }
                return target(req_state, callback, absent, arg);
            } else if (target.hasOwnProperty(what[i])) {
                target = target[what[i]];
            } else {
                return _if_absent();
            }
        }
        //   console.log('found %s', target);
        return callback(null, target);
    } else if (params.hasOwnProperty(what)) {
        //console.log('searching for %s', what);
        if (typeof params[what] == 'function') {
            return params[what](req_state, function (err, value) {
                //  console.log('value of %s is %s', what, value);
                callback(err, value);
            }, absent);
        } else {
        //    console.log('PARAM FOUND returning %s', util.inspect(params[what]));
            return callback(null, params[what]);
        }
    } else {
        _if_absent();
    }

}