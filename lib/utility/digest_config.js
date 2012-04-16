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

                default:
                    target.config[p] = config[p];
            }
        }
    }

   // if (_DEBUG)   console.log('.....target: %s, name: %s', util.inspect(target), target.name());
}