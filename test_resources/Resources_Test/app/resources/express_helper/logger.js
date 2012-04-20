var Express = require('express');
var util = require('util');
var _ = require('underscore');


module.exports = {
    apply: function(server, target, cb){
       // console.log('applying loggeg');
        server.use(Express.logger());
        cb();
    }

}