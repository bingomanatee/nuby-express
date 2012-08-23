var util = require('util');
var _DEBUG = false;
var _ = require('underscore');

/**
 * reads a config object into a target
 * @param target an object for whom configuration proerties are set
 * @param config the config data
 * @param config_context an object that can have a _custom_config rule for special property handling.
 */
module.exports = function (target, config, config_context) {
    if (_DEBUG)  console.log('DIGEST CONFIG: target: %s, config: %s', target.id(), util.inspect(config, null, 0));
    if (!target.hasOwnProperty('config')) {
        target.config = {};
    }

    if (config) {
        for (var p in config) {
            switch (p) {
                case 'parent':
                    target[p] = config[p];
                    break;

                case 'path':
                    target[p] = config[p];
                    break;

                case 'name':
                    target['name'] = config[p]; // note - stored in private var becuase most classes have a name function.
                    break;

                default:
                    if (!target.config){
                        target.config = {};
                    }
                    if (config_context) {
                        if (config_context._custom_config) {
                           // console.log('              testing %s with config_context %s', util.inspect(config_context));
                            if (!config_context._custom_config(p, config[p], target)) {
                                target.config[p] = config[p];
                            }
                        } else {
                            target.config[p] = config[p];
                        }
                    } else {
                        target.config[p] = config[p];
                    }

            }
        }
    }

}