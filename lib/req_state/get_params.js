var _ = require('./../../node_modules/underscore');
var util = require('util');
var Gate = require('./../support/gate');

module.exports = function (req_state, which, callback) {
    var self = req_state;
    var registry = {};

    function _done() {
        callback(registry);
    }

    var gate = new Gate(_done);
    var error = false;
    which.forEach(function (def) {
        if (error) {
            return;
        }
        var tdc = gate.task_done_callback(true);
        var as = false;
        var absent = null;

        if (_.isObject(def)) {
            var what_what = def.what;
            if (def.hasOwnProperty('absent')) {
                absent = def.absent;
            }
            if (typeof absent == 'function') {
                error = true;
                return callback(new Error('req_state.get_params does not accept functions as absent.'));
            }
            if (def.hasOwnProperty('as')) {
                what_what = def.as;
            }
        } else {
            var what_what = def;
        }

        var what_key = _.isArray(what_what) ? what_what.join('.') : what_what;

        function _what_done(value) {
            registry[what_key] = value;
            tdc();
        }

        if (!error) {
            self.get_param(what_what, _what_done, absent);
        }

    });
    if (!error) {
        gate.start();
    }
}