var _ = require('underscore');
var util = require('util');

function Framework(config, app) {
    if (_.isString(config)) {
        var config_path = config;
        config = require(config);
        config.path = config_path;
    }
    _.extend(this, config);
    if (app) {
        this.app = app;
    }
    this.controllers = [];

    this.params = {};
}

Framework.prototype = {
    get_param:function (req_state, what, callback, absent) {
        if (typeof callback !== 'function'){
            throw new Error(util.format('non-function %s passed as callback to framework.get_param', util.inspect(callback)))
        }
        if (this.params.hasOwnProperty(what)) {
            if (typeof this.params[what] == 'function') {
                this.params[what](req_state, callback, absent);
            } else {
                callback(this.params[what]);
            }
        } else if (typeof absent == 'function'){
            absent();
        } else {
            callback(absent);
        }
    },

    start: function(port){
        port = port || 80;
        this.app.listen(port);
    },

    stop: function(){
        this.app.close();
    }
}

module.exports = Framework;