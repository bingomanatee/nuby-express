var _ = require('./../../node_modules/underscore');
var util = require('util');
var Gate = require('./../support/gate');

function Req_State(action, req, res, next) {
    this.req = req;
    this.res = res;
    this.action = action;
    this.controller = action.controller;
    this.framework = action.framework;

    this.next = next;
    this.journal_get = false;
    this.journal_set = true;
    this.journal = [];
    this.params = {};

}

Req_State.prototype = {

    set_params:function (params) {
        _.extend(this.params, params);
    },

    get_session:function (what, def) {
        if (this.req.hasOwnProperty('session')) {
            if (this.req.session.hasOwnProperty(what)) {
                return this.req.session[what];
            } else {
                return def;
            }
        } else {
            return def;
        }
    },

    set_session:function (what, value) {
        this.req.session[what] = value;
    },

    clear_session:function () {
        this.req.session.destroy();
    },

    get_param:function (what, callback, absent) {

        if (_.isArray(what)) {
            var target = this.params;
            for (var i = 0; i < what.length; ++i) {
                if (_.isArray(target)) {
                    if (target.length >= what[i]) {
                        return this.action.get_param(this, what, callback, absent);
                    } else {
                        target = target[what[i]];
                    }
                } else if (typeof (target) == 'function') {
                    var arg;
                    if (i < (what.length - 1)) {
                        arg = what.slice(i + 1);
                    } else {
                        arg = [];
                    }
                    return target(this, callback, absent, arg);
                } else if (target.hasOwnProperty(what[i])) {
                    target = target[what[i]];
                } else {
                    return this.action.get_param(this, what, callback, absent);
                }
            }
            return callback(target);
        } else if (this.params.hasOwnProperty(what)) {
            if (typeof this.params[what] == 'function') {
                return this.params[what](this, callback, absent);
            } else {
                return callback(this.params[what]);
            }
        }
        this.action.get_param(this, what, callback, absent);

    },

    get_params:function (which, callback) {
        var self = this;
        var registry = {};

        function _done() {
            callback(registry);
        }

        var gate = new Gate(_done);
        which.forEach(function (def) {
            var tdc = gate.task_done_callback();


            if (_.isObject(def)) {
                var what_what = def.what;
                var absent = def.absent;
            } else {
                var what_what = def;
                var absent = null;
            }

            var what_key = _.isArray(what_what) ? what_what.join('.') : what_what;

            function _what_done(value) {
                registry[what_key] = value;
                tdc();
            }

            self.get_param(what_what, _what_done, absent);

        });
        gate.start();
    },

    set_param:function (what, value, context, extend) {
        if (extend && _.isObject(value)
            && this.params.hasOwnProperty(what) && _.isObject(this.param[what])) {
            _.extend(this.params[what], value);
        } else {
            this.params[what] = value;
        }
        if (this.journal_set) {
            this.journal_write('set', this.params[what], value, context);
        }
    },

    journal_write:function (action, what, value, context) {
        this.journal.push({
            action:action,
            what:what,
            value:value,
            context:context
        });
    },

    param:function (what) {
        return this.req.param(what);
    },

    render:function (render_path) {
        var self = this;

        function _render_closure(params) {
            self.res.render(render_path, params);
        }

        this.get_param('render', _render_closure, {});
    },

    send:function () {
        var self = this;

        function _send_closure(params) {
            self.res.send(params);
        }

        this.get_param('render', _send_closure, {});
    }

}


module.exports = Req_State;