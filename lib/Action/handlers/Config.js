var Config_Handler = require('./../../handlers/Config');
var util = require('util');
var _ = require('underscore');

function _cc(prop, value, target) {
   //console.log('checking  %s = %s', prop, value);
    switch (prop) {

        case 'route':
         //   console.log('adding route %s', value);
            target[prop] = value;
            return true;
            break;

        case 'action_class':
            target[prop] = value;
            return true;
            break;

        case 'method':
           // console.log('setting method of %s to %s', util.inspect(target), value);
            if (_.isArray(value)) {
                target.method = value; // auto-approving multi-method for now...
            } else {
                value = value.toUpperCase();

                if (!_.include(['GET', 'PUT', 'POST', 'DELETE', "*"], value)) {
                    throw new Error('bad rest verb ' + value + 'passed to config of ' + target.name);
                }
                target.method = value;
            }
            return true;
            break;

        default:
            return false;
    }
}

module.exports = function () {
    var out = Config_Handler(
        {
            re:/^(action_)?((.*)_)?config\.json$/i,
            name:'action_config_handler',
            _custom_config:_cc
        }
    );

   // console.log('config handlers: %s', util.inspect(out));

    return out;
}