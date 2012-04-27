var _ = require('underscore');
var util = require('util');
var async = require('async');

function Req_State(req, res, action, framework) {
    this.req = req;
    this.res = res;
    this.action = action;
    this.controller = action.controller;
    this.framework = action.framework;
    this.req_props = {};
    this.read_req_props();
}

_.extend(Req_State.prototype, {

    read_req_props: require('./read_props'),

    respond:function () {
        console.log('RESPONDING');
    },

    /* ********************** MISC. PASSTHROUGHS ******************* */

    send:function () {
        var a = arguments;
        var args = [].slice.call(a, 0);
        return this.res.send.apply(this.res, args);
    },

    session:function (key, def) {
        if (this.req.hasOwnProperty('session')) {
            if (this.req.session.hasOwnProperty(key)) {
                return this.req.session[key];
            } else {
                return def;
            }
        } else {
            return def;
        }
    },

    set_session:function (key, value) {
        this.req.session[key] = value;
    },

    clear_session: function(key){
        if (this.req.session.hasOwnProperty(key)){
            delete this.req.session[key];
        }
    },

    go:function () {
        var a = arguments;
        var args = [].slice.call(a, 0);
        return this.res.redirect.apply(this.res, args);
    },

    /* ***************** RENDERING *************************** */

    _help:require('./help'),

    render:function (template, input) {
        //   console.log('rendering: ')
        var a = arguments;
        var args = [].slice.call(a, 0);
        var self = this;

        if (_.isObject(input)) {
            this._help(input, function () {
                self.res.render.apply(self.res, args);
            });
            //   console.log('helpers added: %s', util.inspect(input))
        } else {
            this.res.render.apply(this.res, args);
        }
    },

    method:function () {
        return this.req.route.method;
    },

    flash:function (t, m) {
        return  this.req.flash(t, m);
    }
});

module.exports = Req_State;
