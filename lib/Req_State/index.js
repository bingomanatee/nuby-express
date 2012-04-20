var _ = require('underscore');
var util = require('util');

function Req_State(req, res, action, framework) {
    this.req = req;
    this.res = res;
    this.action = action;
    this.controller = action.controller;
    this.framework = framework ? framework : action.framework;
    this.framework = framework;
    this.req_props = {};
    this.read_req_props();
}

_.extend(Req_State.prototype, {

    read_req_props:function () {
        var self = this;
     //   console.log('reading request: %s', util.inspect(this.req));

        if (this.action.config.hasOwnProperty('default_req_props')) {
      //      console.log('drp: %s', util.inspect(this.action.config.default_req_props));
            _.extend(this.req_props, this.action.config.default_req_props);
        }

        if (this.req.hasOwnProperty('params')) {
        //    console.log('parms: %s, keys: %s', util.inspect(this.req.params), util.inspect(this.req.route.keys));
            this.req.route.keys.forEach(function(key_data){
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

    render:function () {
        var a = arguments;
        var args = [].slice.call(a, 0);
        this.res.render.apply(this.res, args);
    },

    method:function () {
        return this.req.route.method;
    }
});

module.exports = Req_State;
