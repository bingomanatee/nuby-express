var _ = require('underscore');
var util = require('util');
var async = require('async');
var _DEBUG_RENDER = false;
var fs = require('fs');
var _TIMER = true;

if (_TIMER) {
    var mt = require('microtime');
}

function Req_State(req, res, action, controller, framework) {
    this.req = req;
    this.res = res;
    this.action = action;
    this.controller = controller;
    this.framework = framework;
    this.req_props = {};
    this.read_req_props();
    if (_TIMER) {
        this.times = [];
        this.add_time('creation');
        this.timer = this.framework ? this.framework.get_config('time', false) : false;
    }
}

_.extend(Req_State.prototype, {

    add_time:function (event, context, ctx_id) {
        this.times.push({
            event:event,
            context:context,
            ctx_id:ctx_id,
            time:mt.nowDouble()
        });
    },

    show_times:function () {
        var start_time = 0;
        console.log("\n ----- TIME REPORT -----")
        var contexts = {};

        function _say_time(t, min_time){
            if (!min_time){
                min_time = start_time;
            }
            if (t.context){
                console.log('%s sec: [%s: %s] %s', t.time - min_time, t.context, t.ctx_id, t.event);
            } else {
                console.log('%s sec: %s', t.time - min_time, t.event);
            }
        }

        function add_context_time(t) {

            if (!t.ctx_id) {
                t.ctx_id = 0;
            }
            if (!contexts[t.context]) {
                contexts[t.context] = [];
            }

            var found = false;
            _.each(contexts[t.context], function (ctx) {
                if (ctx.id == t.ctx_id) {
                    ctx.times.push(t);
                    found = true;
                }
            })

            if (!found) {
                contexts[t.context].push({
                    id:t.ctx_id,
                    times:[t]
                });
            }
        }

        _.forEach(this.times, function (t) {
            if (!start_time) {
                start_time = t.time;
            }

            _say_time(t);

            if (t.context) {
                add_context_time(t);
            }
        });

        _.each(contexts, function(id_groups, name){

            console.log("\n ---------- CONTEXT %s ----------", name);

            id_groups.forEach(function(id_group){
                console.log("\n ---------- CONTEXT %s :: ID %s ----------", name, id_group.id);
                var min_time = Infinity, max_time = 0;

                id_group.times.forEach(function(t){
                    min_time = Math.min(min_time, t.time);
                    max_time = Math.max(max_time, t.time);
                })
                id_group.times.forEach(function(t){ _say_time(t, min_time)});
                console.log("\n ---------- END CONTEXT %s :: ID %s  (span = %s) ----------", name, id_group.id, (max_time - min_time));
            });

            console.log("\n ---------- END CONTEXT %s ----------", name);
        })

        console.log("\n ----- END TIME REPORT -----")
    },

    read_req_props:require('./read_props'),

    respond:function () {
        console.log('RESPONDING');
    },

    /* ********************** MISC. PASSTHROUGHS ******************* */

    send:function (values) {
        var a = arguments;
        var args = [].slice.call(a, 0);
        //   console.log('sending: %s', util.inspect(args));
        return this.res.send(values);
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

    clear_session:function (key) {
        this.req.session[key] = null;
    },

    go:function () {
        var a = arguments;
        var args = [].slice.call(a, 0);
        return this.res.redirect.apply(this.res, args);
    },

    /* ***************** RENDERING *************************** */

    _help:require('./help'),

    render:function (template, input) {
        if (_DEBUG_RENDER) console.log('rendering %s with %s ', template, util.inspect(input, false, 0));
        if (this.timer) {
            this.add_time('render');
        }

        var a = arguments;
        var args = [].slice.call(a, 0);
        var self = this;

        if (_.isObject(input)) {
            this._help(input, function () {
                if (self.timer) {
                    self.add_time('starting res.render');
                }
                self.res.render.apply(self.res, args);
                if (self.timer) {
                    self.add_time('ending res.render');
                    self.show_times();
                }
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
