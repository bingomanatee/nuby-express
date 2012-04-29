var Framework = require('../lib/Framework');
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var path = require('path');

var framework;

var app_path = path.normalize(__dirname + '/../test_resources/Multi_Static_test/app');
var root = 'http://localhost:3345/';

module.exports = {

    setup:function (test) {
        framework = new Framework({path:app_path});
        framework.start_load(function () {
            test.done();
        }, app_path);
    },

    test_server_load:function (test) {
        framework.start_server(function () {
            console.log('%s server listening to %s ', __filename, framework.config.port);
            framework.server().listen(framework.config.port);
            //
            test.done();
        })
    },

    test_static_foo:function (test) {
        request.get(root + 'foo.txt',
            function (err, res, static_foo_body) {
                try {
                    test.equal('foo=1', static_foo_body, 'get foo=1 from foo.txt');
                } catch (err) {
                    test.ok(false, 'err in static: ' + err.toString());
                }

                request.get(root + 'monkey/bar.txt', function(e, res, static_bar_body){
                    try {
                        test.equal('bar=2', static_bar_body, 'get bar=2 from monkey/bar.txt');
                    } catch(err2){
                        test.ok(false, 'err in static: ' + err2.toString());
                    }

                    request(root + 'thereisnofile.txt', function(e, res, static_non_body){
                     //   console.log('static body: %s', static_non_body);
                        test.ok(/^Error: ENOENT,/.test(static_non_body), 'error for non file');
                        test.done();
                    })
                })
            });

    },

    test_done_response:function (test) {
        framework.server().close();
        test.done();
    }

};
