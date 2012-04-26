var Framework = require('../lib/Framework');
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

var framework;

var app_path = path.resolve(__dirname + '/../test_resources/View_Helper_test/app');
var root = 'http://localhost:3336/';

module.exports = {

    setup:function (test) {
        framework = new Framework({path:app_path});
        Roger = {name:"Roger", notes:"three cheese blend"};
        framework.start_load(function () {

            framework.start_server(function () {

                test.equal(framework.config.port, 3336, 'port is 3336');
                framework.server().listen(framework.config.port);

                test.done();
            })
        }, app_path);
    },

    test_view:function (test) {
        request(root, function (err, res, body) {
            test.equal(body, '{"a":4,"b":2,"c":3}', 'foo data from view');
            test.done();
        });
    },

    test_done_response:function (test) {
        framework.server().close();
        mongoose.connection.close();
        test.done();
    }
}
