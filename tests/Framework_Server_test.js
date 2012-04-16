var Framework = require('../lib/Framework');
var path = require('path');

var framework;

var app_path = path.resolve(__dirname + '/../test_resources/FS_test/app');

module.exports = {
    setup: function(test){
        framework = new Framework({path: app_path});

        framework.start_load(function(){
            test.done();
        }, app_path);
    },

    test_server_load: function(test){
        framework.start_server(function(){
            console.log('server started');
            test.ok(true, 'server started with zero work');
            test.done();
        })
    }
}