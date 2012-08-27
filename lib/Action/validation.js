var util = require('util');
var _ = require('underscore');

var _DEBUG = false;

/**
 * This entire module is deprecated. use the error emitting methods instead.
 */
/* ******************* VALIDATION *************** */

var _val_errors = {};

function _make_val_error_name(type, method) {
    if (method) {
        if (type) {
            return util.format('on_%s_%s_error', method, type);
        } else {
            return util.format('on_%s_error', method);
        }
    } else {
        return util.format('on_%s_error', type);
    }
}

function _make_val_error_path(type, method) {
    if (method) {
        if (type) {
            return util.format('_on_%s_%s_error_go', method, type);
        } else {
            return util.format('_on_%s_error_go', method);
        }
    } else {
        return util.format('_on_%s_error_go', type);
    }
}

function _make_val_error(type, method) {

    function _go_path(rs, type, method, go) {
        var valid_error_paths = [];

        var tm_error_go = false;
        var type_error_go = false;
        if (type) {
            tm_error_go = _make_val_error_path(type, method);
            if (this[tm_error_go]) {
                valid_error_paths.push(this[tm_error_go]);
            }
            type_error_go = _make_val_error_path(type, null);
        }

        var method_error_go = _make_val_error_path(null, method);

        if (this[method_error_go]) {
            valid_error_paths.push(this[method_error_go])
        }

        if (type_error_go && this[type_error_go]) {
            valid_error_paths.push(this[type_error_go]);
        }

        valid_error_paths.push('/');

        if (_DEBUG) {
            console.log('method_error_go: "%s", tm_error_go: "%s", type_error_go: "%s"',
                method_error_go, tm_error_go, type_error_go);
            console.log(' valid_error_paths: %s', util.inspect(valid_error_paths));
        }

        var em = valid_error_paths[0];
        if (_DEBUG)  console.log('error -- going to %s', util.inspect(em));
        return em;
    }

    return function (rs, err, go) {
        if (_DEBUG) console.log('error -- %s -- going to %s',
            util.inspect(err), util.inspect(go));
        if (go === true) {
            if (_DEBUG) console.log('sending error %s', util.inspect(err));
            rs.send({error:err});
        } else {
            go = _go_path.call(this, rs, type, method, go);
            if (go === true) {
                if (_DEBUG) console.log('sending error %s', go, util.inspect(err));
                if (err instanceof Error) {
                    err = err.message;
                }
                rs.send({error:err});
            } else {
                if (_.isString(err)) {
                    rs.flash('error', err);
                } else if (err instanceof Error){
                    rs.flash('error', err.message);
                    console.log('error: %s', util.inspect(err));
                }
                if (_DEBUG) console.log('going to %s with error %s', go, util.inspect(err));
                rs.go(go);
            }

        }
    }
}

['', 'get', 'put', 'post', 'delete'].forEach(function (method) {
    if (method) {
        var method_name = _make_val_error_name(null, method);
        if (_DEBUG) console.log('making validation %s', method_name);
        _val_errors[method_name] = _make_val_error('', method)
    }
    ['validate', 'process', 'input', 'output'].forEach(function (type) {
        var method_name = _make_val_error_name(type, method);
        if (_DEBUG) console.log('making validation %s', method_name);
        _val_errors[method_name] = _make_val_error(type, method);
    });
});

module.exports = _val_errors;