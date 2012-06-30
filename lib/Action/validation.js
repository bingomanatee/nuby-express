var util = require('util');
var _ = require('underscore');

var _DEBUG_ERR = false;

/* ******************* VALIDATION *************** */

var _val_errors = {};

function _make_val_error_name(type, method) {
    if (method) {
        return util.format('on_%s_%s_error', method, type);
    } else {
        return util.format('on_%s_error', type);
    }
}

function _make_val_error(type, method) {

    function _go_path(rs, type, method, go) {
        var method_error_go = util.format('_on_%s_%s_error_go', method, type);
        var type_error_go = false;
        if (type) {
            type_error_go = util.format('_on_%s_error_go', type);
            var base = [go, this[method_error_go], this[type_error_go], '/'];
        } else {
            type_error_go = util.format('_on_%s_error_go', method);
            var base = [go, this[method_error_go], '/'];
        }

        base = _.map(base, function (i) {
            if (_.isFunction(i)) {
                return i(rs);
            }
            return i;
        })

        if (_DEBUG_ERR) console.log('method_error_go: %s, type_error_go: %s, base go paths: [%s]',
            method_error_go, type_error_go, _.map(base, util.inspect).join(','));
        var ve_paths = _.filter(base, function (v) {
            if ((typeof v == 'undefined') || (v == 'undefined')) {
                return false;
            }
            return true;
        })

        console.log('ve_paths: %s', util.inspect(ve_paths));

        var em = ve_paths[0];
        if (_DEBUG_ERR)  console.log('error -- going to %s', util.inspect(em));
        return em;
    }

    return function (rs, err, go) {
        if (_DEBUG_ERR) console.log('error -- going to %s', util.inspect(go));
        if (go === true) {
            if (_DEBUG_ERR) console.log('sending error %s', util.inspect(err));
            rs.send({error:err});
        } else {
            go = _go_path.call(this, rs, type, method, go);
            if (go === true) {
                if (_DEBUG_ERR) console.log('sending error %s', go, util.inspect(err));
                rs.send({error:err});
            } else {
                if (_.isString(err)) {
                    rs.flash('error', err);
                }
                if (_DEBUG_ERR) console.log('going to %s with error %s', go, util.inspect(err));
                rs.go(go);
            }

        }
    }
}

['', 'get', 'put', 'post', 'delete'].forEach(function (method) {
    if (method) {
        var method_name = _make_val_error_name(method);
        if (_DEBUG_ERR) console.log('making validation %s', method_name);
        _val_errors[method_name] = _make_val_error('', method)
    }
    ['validate', 'process', 'input', 'output'].forEach(function (type) {
        var method_name = _make_val_error_name(type, method);
        if (_DEBUG_ERR) console.log('making validation %s', method_name);
        _val_errors[method_name] = _make_val_error(type, method);
    });
});

module.exports = _val_errors;