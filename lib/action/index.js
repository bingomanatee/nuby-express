var _ = require('./../../node_modules/underscore');
var Req_State = require('./../req_state');
var path = require('path');
var get_param = require('./../req_state/get_param');
var init = require('./init');
var util = require('util');

function Action(config) {
    init(this, config);
    if (!this.hasOwnProperty('view_path')) {
        var full_view_path = path.join(this.path, 'view.html');
        if (path.existsSync(full_view_path)) {
            this.view_path = full_view_path;
        }
    }
}

Action.prototype = {

    method:'get',

    journal_states:true,

    journal:true,

    load_req_params:false,

    params:{
    },

    get_param:function (req_state, what, callback, absent) {
        var self = this;

        function _absent() {
            self.controller.get_param(req_state, what, callback, absent);
        }

        //     console.log('looking for %s in action %s', _.isArray(what) ? what.join('.') : what, this.path);
        get_param(this.params, req_state, what, callback, _absent);
    },

    get_route:function () {
        var route;
        if (this.route) {
            route = this.route;
        } else {
            route = util.format('%s/%s', this.controller.get_route(), this.name);
        }

        //  console.log('route of %s is %s', this.path, route);

        return route;
    },

    handle:function (req, res, next) {
        var req_state = new Req_State(this, req, res, next);
        if (this.journal_states) {
            //console.log('pushing req_state');
            this.req_journal.push(req_state);
        }
        if (this.load_req_params) {
            var params = {};
            _.extend(params, req.params);
            if (req.query) {
                _.extend(params, req.query);
            }


            if (this.load_req_params === true) {
                req_state.set_params(params, 'handle');
                //    console.log('after setting params %s', util.inspect(req_state.params));
                if (req.hasOwnProperty('body')) {
                    if (_.isObject(req.body)) {
                        req_state.set_params(req.body);
                    } else {
                        req_state.set_param('form', req.body, 'handle');
                    }
                }
            } else {
                //   console.log('into %s', this.load_req_params);
                req_state.set_param(this.load_req_params, params, 'handle', true);
                //   console.log('after setting params %s', util.inspect(req_state.params));
                if (req.hasOwnProperty('body')) {
                    if (_.isObject(req.body)) {
                        req_state.set_param(this.load_req_params, req.body, 'handle', true);
                    } else {
                        req_state.set_param('form', req.body, 'handle');
                    }
                }
            }
        }
        this.auth(req_state);
    },

    auth:function (req_state) {
        if (this.controller.hasOwnProperty('auth')) {
            console.log('checking auth for controller');
            var self = this;
            this.controller.auth(req_state, function () {
                self.if_auth(req_state);
            });
        } else {
            console.log('action %s has no controller auth', this.path);
            this.if_auth(req_state);
        }
    },

    if_auth:function (req_state) {

        function _render_closure(err, params) {
            if (err) {
                req_state.action.error(req_state, err);
            } else {
                req_state.action.render(req_state, params);
            }
        }

        this.execute(req_state, _render_closure);
    },

    /**
     * execute should normally set render params and/or pass them as
     * the second parameter of callback
     */
    execute:function (req_state, callback) {
        callback(null, {});
    },

    render:function (req_state, params) {
        var self = this;

        if (!(typeof params == 'undefined')) {
            req_state.set_param('render', params, 'render', true);
        }

        if (self.view_path) {
            if (self.controller.hasOwnProperty('on_render')) {
                self.controller.on_render(req_state, function () {
                    req_state.render(self.view_path);
                });
            } else {
                req_state.render(self.view_path);
            }

        } else {
            req_state.send();
        }

    },

    error:function (req_state, err) {
        console.log('APPLICATION ERROR: %s', util.inspect(err));
        if (req_state.framework.app.set('flash')) {
            console.log('putting error message in flash');
            req_state.put_flash(_.isString(err) ? err : err.toString(), 'error', '/');
        } else {
            req_state.res.redirect('/');
        }
    }

}

module.exports = Action;