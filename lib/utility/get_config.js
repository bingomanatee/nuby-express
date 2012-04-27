var _ = require('underscore');
var util = require('util');

function get_config(key, def, merge) {
    var self = this;

    if (merge) {

        var this_level = _find(key, this.config, true);
        console.log('merge for %s of %s is %s def %s', this.path, util.inspect(key),
            util.inspect(this_level), util.inspect(def));
        if (!_.isArray(this_level)){
            this_level = [this_level];
        }
        if (this.parent && this.parent.get_config) {
            return this.parent.get_config(key, [], true).concat(this_level);
        } else {
            return this_level;
        }
    }

    function _find(series, target, flat) {
        if (!_.isArray(series)){
            series = series.split(',');
        }
       // console.log('searching for %s in %s', util.inspect(series), util.inspect(target));
        if (series.length == 0) {
            return target;
        }

        var name = series.shift();
        //    console.log('name: %s', name);
        if (target.hasOwnProperty(name)) {
            //      console.log('hit!');
            if (series.length == 0) {
                return target[name];
            }
            return _find(series, target[name]);
        } else if (self.parent && (!flat)) {
            //    console.log('iterating for key %s through %s', key, util.inspect(self.parent, true));
            if (self.parent.get_config) {
                //      console.log('...');
                return self.parent.get_config(key, def);
            } else {
                return def;
            }
        } else {
            // console.log('returnign default %s', def);
            return def;
        }
    }

    return _find(key, this.config);
}

module.exports = get_config;