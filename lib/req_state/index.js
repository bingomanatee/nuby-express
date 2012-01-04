var _ = require('./../../node_modules/underscore');
var util = require('util');

function Req_State(action, req, res, next) {
    this.req = req;
    this.res = res;
    this.action = action;
    this.next = next;
    this.journal_get = false;
    this.journal_set = true;
    this.journal = [];
    this.params = {};

}

Req_State.prototype = {

    get_param:function (what, callback, absent) {

        if (this.params.hasOwnProperty(what)) {
            if (typeof this.params[what] == 'function') {
                this.params[what](this, callback, absent);
            } else {
                callback(this.params[what]);
            }
        } else {
            this.action.get_param(this, what, callback, absent);
        }
    },

    set_param:function (what, value, context) {
        this.params[what] = value;
        if (this.journal_set) {
            this.journal_write('set', what, value, context);
        }
    },

    journal_write:function (action, value, context) {
        this.journal.push({
            action:action,
            value:value,
            context:context
        });
    },

    render:function () {
        var args = arguments;
        this.res.render.apply(this.res, args);
    },

    send:function () {
        var args = arguments;
        this.res.send.apply(this.res, args);
    }

}


module.exports = Req_State;