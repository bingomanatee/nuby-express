var util = require('util');
var _DEBUG = false;
var _ = require('underscore');

module.exports = function (target, config, context) {
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

                case 'route':
                    target[p] = config[p];
                    break;

                case 'action_class':
                    target[b] = config[b];
                    break;

                case 'name':
                    target['name'] = config[b]; // note - stored in private var becuase most classes have a name function.
                    break;

                default:
                    if (context) {
                        if (context._custom_config) {
                           // console.log('              testing %s with context %s', util.inspect(context));
                            if (!context._custom_config(p, config[p], target)) {
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