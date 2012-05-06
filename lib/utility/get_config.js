var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

function get_config(key, def, merge) {
    var self = this;
    if (_DEBUG) console.log('get_config: key = %s', key);

    if (merge) {

        var this_level = _find(key, this.config, true);
        //  console.log('merge for %s of %s is %s def %s', this.path, util.inspect(key),
        //    util.inspect(this_level), util.inspect(def));
        if (!_.isArray(this_level)) {
            this_level = [this_level];
        }
        if (this.parent && this.parent.get_config) {
            return this.parent.get_config(key, [], true).concat(this_level);
        } else {
            return this_level;
        }
    }

    function _find(series, target, flat) {
        if (!_.isArray(series)) {
            series = series.split(',');
        }
        if (_DEBUG) console.log('searching for %s in %s', (series).join(':'), util.inspect(target));
        if (series.length == 0) {
            if (_DEBUG) console.log('returning %s', util.inspect(target));
            return target;
        }

        var name = series.shift();
        if (!target) {
            return def;
        } else if (target.hasOwnProperty(name)) {
            if (_DEBUG) console.log('hit!');
            if (series.length == 0) {
                return target[name];
            }
            return _find(series, target[name]);
        } else if (self.parent && (!flat)) {
           if (_DEBUG) console.log('iterating for key %s through %s', key, util.inspect(self.parent, true));
            if (self.parent.get_config) {

                var out = self.parent.get_config(key, def);
                if (_DEBUG) console.log('returning parents value: %s', util.inspect(out));
                return out;
            } else {
                return def;
            }
        } else {
            if (_DEBUG) console.log('returning default %s', def);
            return def;
        }
    }

    return _find(key, this.config);
}

module.exports = get_config;