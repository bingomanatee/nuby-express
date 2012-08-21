var _ = require('underscore');
var util = require('util');


/* ********************** CLOSURE ******************* */

function _prop_chain(chain, target){
    if (!target){
        return false;
    }
    if (chain.length){
        if (!_.isObject(target)){
            return false;
        }
        var key = chain.shift();
        if (target.hasOwnProperty(key)){
           return _prop_chain(chain, target[key]);
        }
    } else {
        return true;
    }
}

/* ********************** CONTENT VALIDATION ******************* */
module.exports = {

    has:function () {
        if (!this.req_props) {
            return false;
        }
        var args = Array.prototype.slice.call(arguments, 0);
        for (var i = 0; i < args.length; ++i) {
            var a = args[i];

            if (a.indexOf('.') > -1){
                if (!_prop_chain(a.split('.'), this.req_props)){
                    return false;
                }
            } else if (!this.req_props.hasOwnProperty(a)) {
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

            if (a.indexOf('.') > -1){
                if (!_prop_chain(a.split('.'), this.req_props)){
                    return false;
                }
            } else {
                if (!this.req_props.hasOwnProperty(a)) {
                    return false;
                } else if (!this.req_props[a]) {
                    return false;
                }
            }

        }
        return true;
    }

}