var get_param = require('./../req_state/get_param');
var get_params = require('get_params.js');
var init = require('init.js');
var _ = require('../../node_modules/underscore');
var util = require('util');

function Controller(config, framework) {
    if (!config) {
        config = {}
    }
    //  console.log('controller config: %s', util.inspect(config));
    this.framework = framework;
    this.actions = {};
    this.params = {};
    init(this, config);
}

Controller.prototype = {

    get_route:function () {
        if (this.route) {
            return this.route;
        } else {
            return util.format('/%s', this.name);
        }
    },

    get_param:function (req_state, what, callback, absent) {
        var self = this;

        // console.log('looking for %s in controller %s', _.isArray(what) ? what.join('.') : what, this.path);
        function _absent() {
            self.framework.get_param(req_state, what, callback, absent);
        }

        get_param(this.params, req_state, what, callback, _absent);
    },

    get_params:function (which, callback) {
        console.log('controller get params callback:%s', util.inspect(callback));
        get_params(this, which, callback);
    }
}

module.exports = Controller;