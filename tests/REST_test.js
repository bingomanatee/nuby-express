var Framework = require('../lib/Framework');
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

var framework;

var app_path = path.resolve(__dirname + '/../test_resources/REST_test/app');
var root = 'http://localhost:3335/';

function _ss(a) {
    return _.sortBy(a, function (i) {
        return i
    });
}

function _1(a) {
    return _.map(a, function (aa) {
        return aa[0]
    });
}

var Roger;

module.exports = {

    setup:function (test) {
        framework = new Framework({path:app_path});
        Roger = {name:"Roger", notes:"three cheese blend"};
        framework.start_load(function () {
            test.done();
        }, app_path);
    },

    test_server_load:function (test) {
        framework.on('load_done', function () {
            test.ok(!(framework.hasOwnProperty('abc')),
                'framework doesn\'t have alpha on load done');
        });

        framework.start_server(function () {
            test.equal(framework.config.port, 3335, 'port is 3335');
            framework.server().listen(framework.config.port);
           //
            test.done();
        })
    },

    test_prop_response:function (test) {
        request.post({uri:root + 'folks', form:Roger },
            function (err, res, put_body) {
                try {
                 //
                    var Roger_JSON = JSON.parse(put_body);
                    test.ok(Roger_JSON._id, 'return json has ID');
                    var id = Roger_JSON._id;
                    delete Roger_JSON._id;
                    test.deepEqual(Roger, Roger_JSON, 'Rogering');

                    /* *********** RETRIEVE ROGER **************** */

                    process.nextTick(function () {
                        request.get(root + 'folks/' + id, function (err, rest, get_body) {
                          //
                            test.equal(put_body, get_body, 'Can retrieve Roger');

                            /* *********** CALL HIM ROD ************** */

                            request.put({uri:root + 'folks/' + id, form:{name:"Rod"}}, function (err, r, updated_body) {
                            //

                                var altered_rod = JSON.parse(updated_body);
                                test.equal(altered_rod.name, 'Rod', 'name is Rod');
                                test.equal(altered_rod.notes, Roger.notes, 'same old notes');
                                test.done();

                            })

                        });

                    })

                } catch (err) {

                }
            });

    },

    test_done_response:function (test) {
      //  framework.server().close();
        mongoose.connection.close();
        test.done();
    }
}
