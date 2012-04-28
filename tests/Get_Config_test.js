var Framework = require('../lib/Framework');
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var path = require('path');

var framework;

var app_path = path.resolve(__dirname + '/../test_resources/Server_Action_test/app');
var root = 'http://localhost:3333/';

module.exports = {
    setup:function (test) {
        framework = new Framework({path:app_path});

        framework.start_load(function () {
            framework.start_server(function () {
                test.equal(framework.config.port, 3333, 'port is 3333');
                framework.server().listen(framework.config.port);

                test.done();
            })
        }, app_path);
    },

    test_config:function (test) {
        request.get(root + 'config/config', function (er, re, body) {
            var configs = {"qaay":10, "bar":6, "vole":-1};
            test.deepEqual(JSON.parse(body), configs, 'testing config');
            test.done();
        });
    },


    test_config2:function (test) {
        request.get(root + 'config/config2', function (er, re, body) {
            var configs = { dum:[ 4, 3, 1, 2 ] };
            var body_configs = JSON.parse(body);
            configs.dum = _.sortBy(configs.dum, _.identity);
            body_configs.dum = _.sortBy(body_configs.dum, _.identity);
            test.deepEqual(body_configs, configs, 'testing config');
            test.done();
        });
    },

    test_close:function (test) {
        framework.server().close();
        test.done();
    }
}
