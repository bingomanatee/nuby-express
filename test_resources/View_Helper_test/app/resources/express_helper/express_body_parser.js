var express = require('express');

module.exports = {
    init: function(server, target, cb){
       //
        server.use(express.bodyParser());
        cb();
    }
}