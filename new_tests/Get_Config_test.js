var NE = require('./../lib');
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
    setUp:function (cb) {
        framework = new NE.Framework({path:app_path});

        framework.start_load(function () {
            console.log('load done');

            framework.start_server(function () {
                console.log('server started');
                //   console.log('framework: %s', util.inspect(framework));
                framework.server().listen(framework.config.port);

                cb();
            })
        }, app_path);
    },

    test_config:function (t) {
        request.get(root + 'config/config', function (err, re, body) {
            if (err){
                console.log(err);
            } else {
                var configs = {"qaay":10, "bar":6, "vole":-1};
                try {
                    var parsed = JSON.parse(body);
                  //  test.deepEqual(parsed, configs, 'testing config');
                } catch (err) {
                    console.log('bad', body, 'cannot parse body');
                }
            }
            t.done();
        });
    },


    test_config2:function (test) {
        request.get(root + 'config/config2', function (er, re, body) {
            var configs = { dum:[ 4, 3, 1, 2 ] };
            try {
                var body_configs = JSON.parse(body);
                configs.dum = _.sortBy(configs.dum, _.identity);
                body_configs.dum = _.sortBy(body_configs.dum, _.identity);
                test.deepEqual(body_configs, configs, 'testing config');
            } catch (err) {
                console.log('bad', body, 'cannot parse body');
            }
           // test.done();
        });
    },

    tearDown:function (cb) {
        framework.server().close();
        cb();
    }
}
