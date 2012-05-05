var NE = require('./../lib');
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var path = require('path');
var logger = require('./../lib/utility/logger');

var framework;

var app_path = path.resolve(__dirname + '/../test_resources/Server_Action_test/app');
var root = 'http://localhost:3333/';
var started = false;
logger.init(__dirname + './../test_reports/Get_Config_test/log.json');
module.exports = {
    test_start:function (t) {
        framework = new NE.Framework({path:app_path});
        framework.start_load(function () {

            framework.start_server(function () {
                if (started)
                {
                    throw new Error('attempt to start server twice');
                }
                started = true;
                framework.server().listen(framework.config.port);

                t.done();
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
                test.done();
            } catch (err) {
                console.log('bad', body, 'cannot parse body');
            }
           // test.done();
        });
    },

    test_done:function (test) {
        framework.server().close();
        test.done();
    }
}
