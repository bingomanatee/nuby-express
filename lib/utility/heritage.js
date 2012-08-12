var _ = require('underscore');

var H_SEP = ':';

module.exports = function () {
    try {

        var out = [];

        if (this.name) {
            out.push(this.name);
        }

        if (this.parent) {
            if (this.parent.heritage) {
                out.unshift(this.parent.heritage());
            } else if (this.parent.name) {
                out.unshift(this.parent.name);
            }
        }
        return out.join(H_SEP);
    } catch(err){
        console.log('error in heritagge: %s', err.toString());
        return '???';
    }


}