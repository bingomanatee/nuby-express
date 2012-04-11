var _ = require('../../node_modules/underscore');
var util = require('util');

/**
 * This does a deep(er) extend; really, it is more of a deep _.defaults.
 *
 * @TODO: reverse params to be consistent with _.extend
 *
 * @param from_props
 * @param to_props
 */
module.exports = function (from_props, to_props) {

    // console.log('from %s to %s', util.inspect(from_props), util.inspect(to_props));

    if (!_.isObject(from_props)) {
        return to_props;
    }
    for (var p in from_props) {
        var from_value = from_props[p];
        if (_.isObject(from_value)) {
            if (to_props.hasOwnProperty(p)) {
                if (_.isObject(to_props[p])) {
                    _.defaults(to_props[p], from_value);
                }
            } else {
                to_props[p] = _.clone(from_value);
            }
        } else if (_.isArray(from_value)) {
            if (!to_props.hasOwnProperty(p)) {
                to_props[p] = from_value.slice(0);
            }
        } else if (!to_props.hasOwnProperty(p)) {
            to_props[p] = from_value;
        }
    }

    //  console.log('end result: %s', util.inspect(to_props));
    return to_props;
}