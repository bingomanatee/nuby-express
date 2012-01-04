var _ = require('./../../node_modules/underscore');
var Req_State = require('./../req_state');
var path = require('path');

var util = require('util');

function Action(config) {
    this.params = {};
    _.extend(this, config);
    _.defaults(this.params, this._params);
}

function _get_view_path(req_state, callback, absent) {
    var default_path = req_state.action.path + '/view.html';
    path.exists(default_path, function (exists) {
        if (exists) {
            callback(default_path);
        } else if (typeof absent == 'function') {
            absent();
        } else {
            callback(absent);
        }
    });
}

Action.prototype = {

    method:'get',

    _params:{
        view_path:_get_view_path
    },

    get_param:function (req_state, what, callback, absent) {
        if (this.params.hasOwnProperty(what)) {
            if (typeof this.params[what] == 'function') {
                this.params[what](req_state, callback, absent);
            } else {
                callback(this.params[what]);
            }
        } else if (typeof absent == 'function') {
            absent();
        } else {
            callback(absent);
        }
    },

    get_route:function () {
        if (this.route) {
            return this.route;
        } else {
            return util.format('/%s/%s', this.controller.name, this.name);
        }
    },

    handle:function (req, res, next) {
        var req_state = new Req_State(this, req, res, next);
        this.auth(req_state);
    },

    auth:function (req_state) {
        this.if_auth(req_state);
    },

    if_auth:function (req_state) {

        function _render_closure(err, params) {
            req_state.action.render(params, req_state);
        }

        this.execute(req_state, _render_closure);
    },

    execute:function (req_state, callback) {
        callback(null, {});
    },

    render:function (params, req_state) {

        function _render_path_closure(view_path) {
            req_state.render(view_path, params);
        }

        function _render_send_closure(){
            req_state.send(params);
        }

        var view_path = req_state.get_param('view_path', _render_path_closure, _render_send_closure);
    }

}

module.exports = Action;