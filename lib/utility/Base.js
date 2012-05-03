var _ = require('underscore');
var util = require('util');
var fs = require('fs');

var logger = require('./logger');

var _base_id = 0;

function Base(config) {
    this._id = ++_base_id;
    if (config) {
        _.extend(this, config);
    }
}

_.extend(Base.prototype, {

    CLASS: 'Base',

    /* *************** ID ********************** */

    _id:false,

    id:function () {
        if (!this._id) {
            this._id = ++_base_id;
        }
        return this.CLASS + ' ' + this._id;
    },

    /* *************** CONFIG ******************* */

    digest_config: require('./digest_config'),

    /* ***************** REPORTING ************* */

    _JSON_report:require('./JSON_report'),

    to_JSON:function (switches) {
        var out = this._JSON_report(switches);

        return out;
    },

    /* ****************** LOGGER **************** */

    log: function(msg){
        logger.log({msg: msg, target: this.to_JSON()});
    }

});

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = Base;