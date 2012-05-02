var util = require('util');
var _DEBUG = false;
var _ = require('underscore');

module.exports = function (frame, config, context) {
    if (_DEBUG)  console.log('DIGEST CONFIG: frame: %s, config: %s', frame.heritage(), util.inspect(config, null, 0));
    if (!frame.hasOwnProperty('config')) {
        frame.config = {};
    }

    if (config) {
        for (var p in config) {
            switch (p) {
                case 'parent':
                    frame[p] = config[p];
                    break;

                case 'path':
                    frame[p] = config[p];
                    break;

                case 'route':
                    frame[p] = config[p];
                    break;

                case 'action_class':
                    frame[b] = config[b];
                    break;

                case 'name':
                    frame['name'] = config[b]; // note - stored in private var becuase most classes have a name function.
                    break;

                default:
                    if (context) {
                        if (context._custom_config) {
                           // console.log('              testing %s with context %s', util.inspect(context));
                            if (!context._custom_config(p, config[p], frame)) {
                                frame.config[p] = config[p];
                            }
                        } else {
                            frame.config[p] = config[p];
                        }
                    } else {
                        frame.config[p] = config[p];
                    }

            }
        }
    }

}