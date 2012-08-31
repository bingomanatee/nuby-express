var _ = require('underscore');
var util = require('util');
var async = require('async');
var _DEBUG_RENDER = false;
var fs = require('fs');
var _TIMER = false;
var _session = require('./session');
var _validation = require('./validation');

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

if (_TIMER) {
    var timers = require('timers');
    _.extend(Req_State.prototype, timers);
}

_.extend(Req_State.prototype, _session);
_.extend(Req_State.prototype, _validation);

_.extend(Req_State.prototype, {
    CLASS: 'Req_State',

    read_req_props:require('./read_props'),

    respond:function () {
        console.log('RESPONDING'); // WTF?
    },

    /* ********************** MISC. PASSTHROUGHS ******************* */

    send:function (values) {
        var a = arguments;
        var args = [].slice.call(a, 0);
        return this.res.send(values);
    },

    go:function () {
        var a = arguments;
        var args = _.toArray(a);
        return this.res.redirect.apply(this.res, args);
    },

    /* ***************** RENDERING *************************** */

    _help:require('./help'),

    render:function (template, input) {
        if (_DEBUG_RENDER) {
            console.log('rendering %s with %s ', template, util.inspect(input, false, 0));
            if (_DEBUG_RENDER > 1) {
                console.log(fs.readFileSync(template, 'utf8'));
                console.log(' ------------- end template -----------');
            }
        }
        if (this.timer) {
            this.add_time('render');
        }

        var a = arguments;
        var args = [].slice.call(a, 0);
        var self = this;

        if (!_.isObject(input)) {
            input = {};
            args[1] = input;
        }
        this._help(input, function () {
            if (self.timer) {
                self.add_time('starting res.render');
            }

                if (_DEBUG_RENDER) {
                    console.log('final input == %s ', util.inspect(args[1], false, 0));
                }
            self.res.render.apply(self.res, args);
            if (self.timer) {
                self.add_time('ending res.render');
                self.show_times();
            }
        });

    },

    method:function () {
        return this.req.route.method;
    },

    flash:function (t, m) {
        return  this.req.flash(t, m);
    }
});

module.exports = Req_State;
