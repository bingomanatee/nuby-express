var express = require('express');

module.exports = {
    apply: function(server, target, cb){
       //
        server.use(express.bodyParser());
        cb();
    }
}