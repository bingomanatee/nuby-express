var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

function direct_configs(target, def) {

    if (!target) {
        target = this.config;
        if (!target){
            return def;
        }
    }

    var out = {};
    _.extend(out, target);
     if (def){
         _.extend(out, def);
     }
    return out;
}

module.exports = direct_configs;

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
