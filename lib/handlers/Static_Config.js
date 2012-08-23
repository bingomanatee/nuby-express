var Config_Handler = require('./Config');
var util = require('util');
var _ = require('underscore');

module.exports = function () {
    var out = Config_Handler(
        {
            re:/^(static_)?config\.json$/i,
            name:'static_config_handler'
        }
    );

    return out;
}