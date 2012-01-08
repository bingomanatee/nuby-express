var _ = require('underscore');
var util = require('util');

var get_param = require('../req_state/get_param');
var set_fw_layout = require('./set_fw_layout');

function Framework(config, app) {
    var params = {flash_keys:[], render: {}};
    if (_.isString(config)) {
        var config_path = config;
        config = require(config);
        config.path = config_path;
    }
    _.extend(this, config);
    if (this.params){
        _.defaults(this.params, params);
    } else {
        this.params = params;
    }
    if (app) {
        this.app = app;
    }
    this.controllers = [];

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

    set_layout: function(lpath){
        set_fw_layout(this, lpath);
    }
}

module.exports = Framework;