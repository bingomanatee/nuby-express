var _ = require('./../../node_modules/underscore');
var Req_State = require('./../req_state');
var path = require('path');

var util = require('util');

function Action(config) {
    this.params = {};
    _.extend(this, config);
    _.defaults(this.params, this._params);

    if (this.journal_states){
        this.req_journal = [];
    }
}

function _get_view_path(req_state, callback, absent) {
    var default_path = req_state.action.path + '/view.html';
    path.exists(default_path, function (exists) {
        if (exists) {
            callback(default_path);
        } else {
            req_state.controller.get_param(req_state, 'view_path', callback, absent);
        }
    });
}

Action.prototype = {

    method:'get',

    journal_states: true,

    journal: true,

    load_req_params: false,

    _params:{
        view_path:_get_view_path
    },

    get_param:function (req_state, what, callback, absent) {
        if (typeof callback !== 'function'){
            throw new Error(util.format('non-function %s passed as callback to action.get_param', util.inspect(callback)))
        }
        if (this.params.hasOwnProperty(what)) {
            if (typeof this.params[what] == 'function') {
                this.params[what](req_state, callback, absent);
            } else {
                callback(this.params[what]);
            }
        } else {
            this.controller.get_param(req_state, what, callback, absent);
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
        if (this.journal_states){
            //console.log('pushing req_state');
            this.req_journal.push(req_state);
        }
        if (this.load_req_params){
          //  console.log('loading req params: %s', util.inspect(req.params));
            req_state.set_params(req.params);
            if (req.hasOwnProperty('body') && _.isObject(req.body)){
                req_state.set_params(req.body);
                req_state.set_param('form', req.body);
            }
        }
        this.auth(req_state);
    },

    auth:function (req_state) {
        this.if_auth(req_state);
    },

    if_auth:function (req_state) {

        function _render_closure(err, params) {
            req_state.action.render(req_state, params);
        }

        this.execute(req_state, _render_closure);
    },

    /**
     * execute should normally set render params and/or pass them as
     * the second parameter of callback
     */
    execute:function (req_state, callback) {
        callback();
    },

    render:function (req_state, params) {
        if (!(typeof params == 'undefined')){
            req_state.set_param('render', params, 'render', true);
        }

        function _render_path_closure(view_path) {
            req_state.render(view_path);
        }

        function _render_send_closure() {
            req_state.send();
        }

       req_state.get_param('view_path', _render_path_closure, _render_send_closure);
    }

}

module.exports = Action;