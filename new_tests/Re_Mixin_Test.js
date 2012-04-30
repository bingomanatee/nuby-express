var Framework = require('../lib/Framework');
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var path = require('path');

var framework;

var app_path = path.resolve(__dirname + '/../test_resources/Re_Load_Mixin_Test/app');
var root = 'http://localhost:3363/';

module.exports = {
    setup:function (test) {
        framework = new Framework({path:app_path});

        framework.start_load(function () {
            test.done();
        }, app_path);
    },

    test_server_load:function (test) {
        framework.start_server(function () {

            setTimeout(function(){
                console.log('remixin mixins: %s', util.inspect(framework.get_resources('mixin')));
                console.log('framework config: %s', util.inspect(framework.config));
                test.equal(framework.config.port, 3363, 'port is 3363');
                framework.server().listen(framework.config.port);
                test.deepEqual({}, framework.config.thetans, 'thetans');
                test.done();
            }, 3000);

        })
    },

  /*  test_prop_response:function (test) {

    },*/

    test_close: function(test){
        console.log('%s server DONE listening to %s ', __filename, framework.config.port);
       framework.server().close();
        test.done();
    }
}
