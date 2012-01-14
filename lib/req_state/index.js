var _ = require('./../../node_modules/underscore');
var util = require('util');
var Gate = require('./../support/gate');
var get_param = require('./get_param');
var get_params = require('./get_params');
var prop_extend = require('./prop_extend');

function _debug(msg, param, a, b) {
    return;
    if (param) {
        msg = util.format(msg, param, a, b);
    }
    console.log('default loader:: %s', msg);
}

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
    prop_extend(action.params, this.params);
}

Req_State.prototype = {

    /* ****************** SESSION ************************ */

    /**
     * Retrieve session stored variables.
     * Returns def if non existant.
     *
     * @param what
     * @param def
     */

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

    /* ****************** PARAMETERS ****************** */

    /**
     * Params are arbitrary values or configuration settings
     * that delegate to action, controller, or framework settings.
     * note that parameters can also be made dynamic
     * by setting their values to functions.
     *
     */

    /**
     * Sets a series of parameters, for the duration of the request.
     * @param params
     */

    set_params:function (params, context) {

        _.extend(this.params, params);
        if (this.journal_set) {
            this.journal_write('set_many', '(params)', params, context);
        }
    },

    get_param:function (what, callback, absent) {
     //   console.log('REQ_STATE: getting param %s', _.isArray(what) ? what.join('.') : what);
        var self = this;

        function _absent() {
            self.action.get_param(self, what, callback, absent);
        }

        get_param(this.params, this, what, callback, _absent);
    },

    /**
     * Gets a series ov variables.
     * The callback recieves a hash of all the values.
     * Note that which can be an array of request sets as in
     *     [{
     *        what: 'userid',
     *        absent: 0
     *        },
     *       {
     *         what: 'shoppingcart'
     *         },
     *         {
     *         what: ['render','comments']
     *         }
     *      ]
     *
     *      or strings
     *      ['userid', 'shoppingcart', ['render', 'comments']]
     *
     *      or a mixture of the two.
     *
     *      note-does NOT accept functions for absent as that can
     *      lead to unpredictable results.
     *
     * @param which:
     * @param callback
     */

    get_params:function (which, callback) {
        get_params(this, which, callback);
    },

    _do_extend:function (what, target, value, context) {

        //console.log('extending %s with ', what, util.inspect());
        if (!target.hasOwnProperty(what)) {
            //    console.log('... no existing - doing straight write');
            target[what] = value;
        } else if (_.isArray(value)) {
            if (_.isArray(target[what])) {
                target[what] = target[what].concat(value);
            } else {
                target[what] = value;
            }
        } else if (_.isObject(value)) {
            if (_.isObject(target[what])) {
                //   console.log('... merging existing %s with %s', util.inspect(target[what]), util.inspect(value));
                _.extend(target[what], value);
            } else {
                target[what] = value;
            }
        } else {
            target[what] = value;
        }
    },

    set_param:function (what, value, context, extend) {
        if (_.isArray(what)) {
            var target = this.params;
            while (what.length > 1) {
                var ww = what.shift();
                if (!target.hasOwnProperty(ww)) {
                    target[ww] = {};
                }
                target = target[ww];
            }

            this._do_extend(what.shift(), target, value, context);
        } else if (extend) {
            this._do_extend(what, this.params, value, context);
        } else {
            this.params[what] = value;
        }
        if (this.journal_set) {
            this.journal_write('set', this.params[what], value, context);
        }
    },

    /**
     * The journal tracks all setting of parameters within the scope
     * of a request for diagnostic purposes.
     *
     * @param action -- usually 'set'
     * @param what
     * @param value
     * @param context -- the calling function
     */

    journal_write:function (action, what, value, context) {
        this.journal.push({
            action:action,
            what:what,
            value:value,
            context:context
        });
    },

    /**
     * Note - this is distinct from 'get_param' - it is
     * just shorthand to the request method of the same name
     *
     * @param what
     */

    param:function (what) {
        return this.req.param(what);
    },

    /* ******************** ROUTING ********************* */

    put_flash:function (msg, type, redirect_to) {
        if (!type) {
            type = 'info';
        }

        if (_.isArray(msg)) {
            msg.unshift(type);
            this.req.flash.apply(this.req, msg);
        } else {
            this.req.flash(type, msg);
        }

        if (redirect_to) {
            this.res.redirect(redirect_to);
        }
    },

    get_flash:function (type) {
        if (!type) {
            type = 'info';
        }
        return this.req.flash(type);
    },

    /* ******************** RENDERING ******************* */

    /**
     * a gateway to the response render.
     * @param render_path
     */

    render:function (render_path) {
        var self = this;

        function _render_closure(err, values) {
          // console.log('rc values: %s', util.inspect(values));
            var render_params = values.render;
            if (!(_.isNull(values.layout))) {
                // false is a valid value
                render_params.layout = values.layout;
            }

            _debug('_render Closure with rs = %s', util.inspect(self, null, 1));
            if (values.layout_id) {
           //     console.log('loading layout id %s', values.layout_id);
                if (self.framework.layouts.hasOwnProperty(values.layout_id)) {
                    render_params.layout = self.framework.layouts[values.layout_id].template;
                } else {
                    throw new Error('cannot find layout id ' + values.layout_id);
                }
            } else {
             //   console.log('no layout id');
            }

            if (values.flash_keys && (values.flash_keys.length)) {
                values.flash_keys.forEach(function (key) {
                    render_params[key] = self.req.flash(key);
                });
            }

            self.res.render(render_path, render_params);
        }

        this.get_params([
            {what:'render', absent:{}},
            {what:'flash_keys', absent:[]},
            {what:'layout_id', absent:null},
            {what:'layout', absent:null}
        ],
            _render_closure
        );
    },

    /**
     * a gateway to response send.
     */
    send:function () {
        var self = this;

        function _send_closure(err, params) {
            var status = self.res.statusCode;
           //  console.log('sending %s with status code %s', util.inspect(params), status);
            self.res.send(params, status);
        }

      // console.log('req_stat params: %s', util.inspect(self.params));

        this.get_param('render', _send_closure, {});
    },

    /* ********************** MISC. PASSTHROUGHS ******************* */

    get method() {
        return this.req.route.method;
    }
}


module.exports = Req_State;