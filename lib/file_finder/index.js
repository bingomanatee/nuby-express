var path = require('path');
var util = require('util');

var _ = require('./../../node_modules/underscore');

module.exports = function(root_path, choices, do_require, no_match, echo){

    for (var i = 0; i < choices.length; ++i) {
        var full_path;
        var p = choices[i];
        if (_.isFunction(p)) {
            full_path = p(root_path, path.basename(root_path));
        } else {
            full_path = util.format(p, root_path);
        }
        if (path.existsSync(full_path)) {
            if (echo ){
                console.log('finding path in %s: FOUND file at %s', root_path, full_path);
            }
            return do_require ? require(full_path) : full_path;
        } else if (echo){
            console.log('finding path in %s: no file at %s', root_path, full_path);
        }
    }
    if (typeof no_match == 'undefined') {
        no_match = false;
    }
    return no_match;
}