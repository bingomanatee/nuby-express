var Config_Handler = require('./../../utility/handler/Config');

function _cc(prop, value, target) {
    switch (prop) {
        case 'method':
            if (_.isArray(value)) {
                target.method = value; // auto-approving multi-method for now...
            } else {
                value = value.toUpperCase();

                if (!_.include(['GET', 'PUT', 'POST', 'DELETE'], value)) {
                    throw new Error('bad rest verb ' + value + 'passed to config of ' + target.name());
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
    return Config_Handler(
        {
            re:/^(action_)?((.*)_)?config\.json$/i,
            name:'action_config_handler',
            _custom_config:_cc
        }
    );

}