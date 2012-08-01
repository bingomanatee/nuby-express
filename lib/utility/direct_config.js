var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

function direct_config(key, target, def) {
  if (_DEBUG) console.log('looking for %s', key);
    var self = this;
    if (!key) {
        throw new Exception('attempt to find empty property of %s', util.inspect(this));
    }

    if (!target) {
        target = this.config;
        if (!target){
            return def;
        }
    }

    return _find(key, target, def);
}

module.exports = direct_config;

function _find(series, target, def) {
    if (!_.isArray(series)) {
        series = series.split('.');
    }
    for (var i = 0; i < series.length; ++i){
        var name = series[i];
        if (_DEBUG){
            console.log( 'looking for %s in %s', name, util.inspect(target));
        }

        if ((typeof target != 'object') || (!target.hasOwnProperty(name))){
            return def;
        }
        target = target[name];
    }

    return target;
}
