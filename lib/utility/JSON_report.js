var _ = require('underscore');

module.exports = function (switches) {
    var out = {id:this.id()};


    function _not_false(prop) {
        return (!switches) || (!switches.hasOwnProperty(prop)) ||  (switches[prop] !== false);
    }

    function _to_json(i) {
        return i.to_JSON();
    }

    if (this.path && _not_false('show_path')){
        out.path = this.path;
    }

    if (this.handlers && _not_false('show_handlers')) {
        out.handlers = _.map(this.handlers, _to_json)
    }

    if (this.config && _not_false('show_config')) {
        out.config = _.clone(this.config);
    }
    return out;
};
