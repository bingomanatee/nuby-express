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

    read_req_props:function () {
        var self = this;
        //   console.log('reading request: %s', util.inspect(this.req));
        //  console.log('action: %s', util.inspect(this.action));

        if (this.action.config.hasOwnProperty('default_req_props')) {
            //      console.log('drp: %s', util.inspect(this.action.config.default_req_props));
            _.extend(this.req_props, this.action.config.default_req_props);
        }

        if (this.req.hasOwnProperty('params')) {
            //    console.log('parms: %s, keys: %s', util.inspect(this.req.params), util.inspect(this.req.route.keys));
            this.req.route.keys.forEach(function (key_data) {
                var key = key_data.name;
                self.req_props[key] = self.req.param(key);
            });

        }

        if (this.req.hasOwnProperty('query')) {
            //     console.log('query: %s', util.inspect(this.req.query));
            _.extend(this.req_props, this.req.query);
        }

        if (this.req.hasOwnProperty('body')) {
            if (_.isObject(this.req.body)) {
                //      console.log('body: %s', util.inspect(this.req.body));
                _.extend(this.req_props, this.req.body);
            } else {
                this.req_props.body = this.req.body;
            }
        }

        //  console.log('FINAL PROPS: %s', util.inspect(this.req_props));
    },

    respond:function () {
        console.log('RESPONDING');
    },

    /* ********************** MISC. PASSTHROUGHS ******************* */

    send:function () {
        var a = arguments;
        var args = [].slice.call(a, 0);
        this.res.send.apply(this.res, args);
    },

    _help:function (input, cb) {
        var view_helpers = this.framework.get_resources('view_helper');
        //  console.log('resources: %s', util.inspect(this.framework, true, 0));
        console.log('%s view helpers found', view_helpers.length);
        var self = this;
        var queue = async.queue(function(helper, callback){
            console.log('initializing helper %s', helper.name);
            helper.init(self, input, callback);
        }, 10);

        queue.drain = cb;

        queue.push(view_helpers, function(err, helper){
            console.log('finished initializing helper %s', helper);
            // callback for init
        });
    },

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
