var _ = require('underscore');
var util = require('util');

var get_param = require('../req_state/get_param');
var add_layout = require('add_layout.js');
var add_layouts = require('add_layouts.js');

function Framework(config, app) {
    this.layouts = {};
    this.models = {};
    this.resources = {};
    this.render_filters = [];
    this._render_filters = [];
    var params = {flash_keys:[], render:{}};
    if (_.isString(config)) {
        var config_path = config;
        config = require(config);
        config.path = config_path;
    }

    _.extend(this, config);
    if (!this.params) {
        this.params = params;
    }
    _.defaults(this.params, params);

    if (app) {
        this.app = app;
    }
    this.controllers = [];

    var self = this;

}

Framework.prototype = {
    get_param:function (req_state, what, callback, absent) {
        //      console.log('get_param for framework %s', util.inspect(this.params));
        get_param(this.params, req_state, what, callback, absent); // maybe percolate to app?
    },

    start:function (port) {
        port = port || 80;
        this.app.listen(port);
    },

    stop:function () {
        this.app.close();
    },

    add_layout:add_layout,

    add_layouts:add_layouts,

    add_render_filter:function (filter, rank) {
        if (!rank) {
            rank = 0;
        }
        this._render_filters.push({filter:filter, rank:rank});
        this._render_filters = _.sortBy(this._render_filters, function (f) {
            return f.rank;
        });
        this.render_filters = _.map(this._render_filters, function(f){return f.filter; });
    }

}


module.exports = Framework;