var _ = require('./../../../../node_modules/underscore');
var util = require('util');

function Action(config) {
    _.extend(this, config);
}

Action.prototype = {

    method:'get',

    get_route:function () {
        if (this.route) {
            return this.route;
        } else {
            return util.format('/%s/%s', this.controller.name, this.name);
        }
    },

    handle:function (req, res, next) {
        this.auth(req, res, next);
    },

    auth:function (req, res, next) {
        this.if_auth(req, res, next);
    },

    if_auth:function (req, res, next) {
        var action = this;

        function _render_closure(err, params) {
            action.render(params, req, res, next);
        }

        this.execute(req, res, _render_closure);
    },

    execute:function (req, res, callback) {
        callback(null, {});
    },

    render:function (params, req, res, next) {
        if (this.view_path) {
            res.render(this.view_path, params);
        } else {
            res.send(params);
        }
    },

    view_path:''

}

module.exports = Action;