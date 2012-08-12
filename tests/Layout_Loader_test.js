var util = require('util');
var path = require('path');
var fs = require('fs');
var events = require('events')
var _ = require('underscore');
var module_root = path.dirname(__dirname);
var app_path = module_root + '/test_resources/Layout_Test/app';
var NE = require(module_root + '/lib')
var framework;
var request = require('request');
var mongoose = require('mongoose');
var app_uri = 'http://localhost:3344';

module.exports = {
    test_setup:function (test) {
        framework = new NE.Framework({path:app_path});
        framework.start_load(function () {
            framework.start_server(function () {
                framework.server().listen(framework.config.port);
                test.done()
            })
        })
    },

    test_layout:function (test) {
        var layout_names = _.pluck(framework.get_resources('layout'), 'name');
        layout_names = _.sortBy(layout_names, _.identity);
        test.deepEqual(layout_names, ['empty','folks', 'foo'], 'find layouts');
        test.done();
    },

    test_config_layout_choice:function (test) {
        request.get(app_uri + '/', function (err, res, body) {
            test.equal('<html><head><script src="/foo/js/bar.js"></script></head><h1>Foo</h1>Home</html>', body, 'testing home page with foo layout');
           // console.log(util.inspect(res));
            test.done();
        });
    },

    test_action_layout_choice: function(test){
        request.get(app_uri + '/bar/bar', function (err, res, body) {
            test.equal('<html><head><script src="/foo/js/bar.js"></script></head><h1>Foo</h1>Bar</html>', body, 'testing home page with foo layout');
            // console.log(util.inspect(res));
            test.done();
        });

    },

    test_base: function(test){
        request.get(app_uri + '/bar/bar2', function (err, res, body) {
            test.equal('Bar2', body, 'testing home page with foo layout');
            // console.log(util.inspect(res));
            test.done();
        });
    },

    test_fokls: function(test){
        request.get(app_uri + '/bar/bar3', function (err, res, body) {
            test.equal('<folks>Bar3</folks>', body, 'testing home page with foo layout');
            // console.log(util.inspect(res));
            test.done();
        });
    },

    test_done:function (test) {
        framework.server().close();
        mongoose.disconnect();
        test.done();
    }

}