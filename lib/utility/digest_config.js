var util = require('util');
var _DEBUG = false;

module.exports = function(target, config){
  if (_DEBUG)  console.log('target: %s, config: %s', util.inspect(target), util.inspect(config));
    if (!target.hasOwnProperty('config')){
        target.config = {};
    }

    if (config){
        for (var p in config){
            switch(p){
                case 'parent':
                    target[p] = config[p];
                    break;

                case 'path':
                    target[p] = config[p];
                    break;

                default:
                    target.config[p] = cofig[p];
            }
        }
    }

 if (_DEBUG)   console.log('.....target: %s, name: %s', util.inspect(target), target.name());
}