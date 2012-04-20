var path = require('path');
var util = require('util');

var _ = require('underscore');

module.exports = function(root_path, choices, name, do_require, no_match){

    for (var i = 0; i < choices.length; ++i) {
        var full_path;
        var p = choices[i];
        if (_.isFunction(p)) {
            full_path = p(root_path, name);
        } else {
            full_path = util.format(p, root_path, name);
        }
        if (path.existsSync(full_path)) {
            return do_require ? require(full_path) : full_path;
        }
    }
    if (typeof no_match == 'undefined') {
        no_match = false;
    }
    return no_match;
}