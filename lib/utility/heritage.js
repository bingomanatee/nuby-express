var _ = require('underscore');

var H_SEP = ':';

module.exports = function(){
    var out = [];

    if (this.name){
        if (_.isFunction(this.name)){
            out.push(this.name());
        } else {
            out.push(this.name);
        }
    }

    if (this.parent){
        if (this.parent.heritage){
            out.unshift(this.parent.heritage());
        } else if (this.parent.name){
            if (_.isFunction(this.parent.name)){
                out.unshift(this.parent.name())
            } else {
                out.unshift(this.parent.name);
            }
        }
    }

    return out.join(H_SEP);

}