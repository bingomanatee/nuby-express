var Config_Handler = require('./../../handlers/Config');
var util = require('util');
var _ = require('underscore');

function _cc(prop, value, frame) {
   //console.log('checking  %s = %s', prop, value);
    switch (prop) {
        case 'method':
           // console.log('setting method of %s to %s', util.inspect(frame), value);
            if (_.isArray(value)) {
                frame.method = value; // auto-approving multi-method for now...
            } else {
                value = value.toUpperCase();

                if (!_.include(['GET', 'PUT', 'POST', 'DELETE', "*"], value)) {
                    throw new Error('bad rest verb ' + value + 'passed to config of ' + frame.name);
                }
                frame.method = value;
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