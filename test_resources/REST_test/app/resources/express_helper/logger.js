var Express = require('express');
var util = require('util');
var _ = require('underscore');


module.exports = {
    init: function(server, target, cb){
       //
        server.use(Express.logger());
        cb();
    }

}