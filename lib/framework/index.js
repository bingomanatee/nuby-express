var _ = require('underscore');
var util = require('util');

function Framework(config, app) {
    if (_.isString(config)) {
        var config_path = config;
        config          = require(config);
        config.path     = config_path;
    }
    _.extend(this, config);
    if (app){
        this.app = app;
    }
    this.controllers = [];
}

module.exports = Framework;