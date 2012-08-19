var _ = require('underscore');
var util = require('util');

module.exports = {

    /* ********************** CONTENT VALIDATION ******************* */

    has:function () {
        if (!this.req_props) {
            return false;
        }
        var args = Array.prototype.slice.call(arguments, 0);
        for (var i = 0; i < args.length; ++i) {
            var a = args[i];

            if (!this.req_props.hasOwnProperty(a)) {
                return false;
            }
        }

        return true;
    },

    has_content:function () {

        if (!this.req_props) {
            return false;
        }
        var args = Array.prototype.slice.call(arguments, 0);

        for (var i = 0; i < args.length; ++i) {
            var a = args[i];

            if (!this.req_props.hasOwnProperty(a)) {
                return false;
            } else if (!this.req_props[a]) {
                return false;
            }
        }
        return true;
    },

}