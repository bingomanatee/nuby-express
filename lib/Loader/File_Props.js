var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var Base = require('./../utility/Base');

/* ***************** CLOSURE ************* */

function File_Props(config) {
    Base.call(this, config);
}

util.inherits(File_Props, Base);

_.extend(File_Props.prototype, {
    CLASS: 'File_Props',

/* ************** REPORTER ********** */

    to_JSON:function (switches) {
        var out = Base.prototype.to_JSON.call(this, switches);
        delete out.controller;

        out.full_path = this.full_path;
        out.context = this.context ? this.context.to_JSON() : false;
        out.frame = this.frame? this.frame.to_JSON({controllers: false, components: false}) : false;

        return out;
    }

});

/* ***************** MODULE *********** */

module.exports = File_Props;