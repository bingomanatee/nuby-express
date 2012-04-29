var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var util = require('util');

var _debug = false;

function Path_Handler(config) {
    _.extend(this, config);
}

_.extend(Path_Handler.prototype, {

    re:null,

    /**
     * Type can be 'file', 'dir', 'both', or 'other'.
     */
    type: 'file',

    /**
     * Determines if this handlers is appropariate for this path.
     * Ostensibly returns a boolean, but as a convenience, will return the regex match
     * (if a match is made).
     * @param match_path
     */

    can_handle:function (match_path) {
        if (match_path) {
            if (this.re){
                var basename = path.basename(match_path);
                var match = this.re.exec(basename);
            //    console.log('%s can handle %s', this.name, match_path);
                return match;
            } else {
                throw new Error(util.format('no match for path %s regex in %s; either override can_handle or provide a regex.',
                    match_path, util.inspect(this)));
            }
        }  else {
            throw new Error(util.format('handlers %s passed empty path', util.inspect(this)));
        }
    },

    handle:function (match_path, callback, target) {
        if (!_.isFunction(callback)){
            throw new Error('non function called to Path_Handler %s', util.inspect(this));
        }
        if (!target){
            throw new Error('no target called to Path_Handler.handle');
        }
        var match = this.can_handle(match_path);
        if (match) {
            this.execute(match_path, callback, target, match);
            return true;
        } else {
            return false;
        }
    },

    execute:function (match_path, callback) {
        throw new Error('execute called on Path Handler. Must override abstract method: ' + match_path);
    }

});

module.exports = Path_Handler;