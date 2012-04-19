var _ = require('underscore');
var Resource = require('./../../../../../lib/Resource');
var Express = require('express');
var util = require('util');
var _ = require('underscore');
function Express_Logger(config){
    this.logger = Express.logger(config);
}

_.extend(Express_Logger.prototype, {
    name: 'express_logger',
    type: 'express_helper',

    apply: function(server, target, cb){
        console.log('applying loggeg');
        server.use(this.logger);
        cb();
    }

});

module.exports = function(config){
    return new Express_Logger(config);
}