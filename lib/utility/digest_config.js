var util = require('util');
var _DEBUG = false;

module.exports = function (target, config, skip_log) {
    if (_DEBUG && (!skip_log))  console.log('DIGEST CONFIG: target: %s, config: %s', target.heritage(), util.inspect(config, null, 0));
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
                    target['_name'] = config[b]; // note - stored in private var becuase most classes have a name function.
                    break;

                default:
                    if (this.hasOwnProperty('_custom_config')) {
                        if (!this._custom_config(p, config[p], target)) {
                            if (target.hasOwnProperty('_custom_config')) {
                                if (!target._custom_config(p, config[p], target)) {
                                    target.config[p] = config[p];
                                }
                            } else {
                                target.config[p] = config[p];
                            }
                        }
                    } else if (target.hasOwnProperty('_custom_config')) {
                        if (!target._custom_config(p, config[p], target)) {
                            target.config[p] = config[p];
                        }
                    } else {
                        target.config[p] = config[p];
                    }
            }
        }
    }

}