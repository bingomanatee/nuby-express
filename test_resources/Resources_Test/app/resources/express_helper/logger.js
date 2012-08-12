var Express = require('express');
var util = require('util');
var _ = require('underscore');


module.exports = {
    start_server: function(server, frame, cb){
       //
        server.use(Express.logger());
        cb();
    }

}