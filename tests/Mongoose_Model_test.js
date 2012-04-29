var Framework = require('../lib/Framework');
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mmt');

var framework;

var app_path = path.resolve(__dirname + '/../test_resources/Mongoose_Model_test/app');
var folk_model = require(app_path + '/resources/model/model_folks')();
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

var data = [
    {name:'George Foo', gender:1, notes:'Head of the Foo Foundation', birthday:new Date('1/1/2000')},
    {name:'Susan Soy', gender:-1, notes:'Puts out', birthday:new Date('1/10/1980')}
];

var root = 'http://localhost:3334/';

module.exports = {
    setup:function (test) {
        framework = new Framework({path:app_path});

        framework.start_load(function () {
         //
            var m = folk_model.all(function (err, models) {
             //

                if (err) {
                    throw err;
                }
                models.forEach(function (model) {
                    model.remove();
                });

                data.forEach(function (folk) {
                    folk_model.put(folk, function (err, doc) {
                     //
                    });
                })
                test.done();
            });
           //
        }, app_path);
    },

    test_model:function (test) {
        folk_model.count(function (err, count) {
            test.equal(count, 2);
            test.done();
        })
    },

    test_server_load:function (test) {
        framework.on('load_done', function () {
            test.ok(!(framework.hasOwnProperty('abc')),
                'framework doesn\'t have alpha on load done');
        });

        framework.start_server(function () {
            test.equal(framework.config.port, 3334, 'port is 3334');
            console.log('server listening to %s ', framework.config.port);
            framework.server().listen(framework.config.port);

            test.done();
        })
    },

    test_rest:function (test) {
        var new_guy = {name:"NewGuy", gender:1, notes:"I made this"};
        request.post({uri:root + 'folks',
            form:new_guy
        }, function (err, res, body) {
            //
            var new_guy_json = JSON.parse(body);
            test.equal(new_guy_json.name, new_guy.name, 'made new guy');
            test.ok(new_guy_json._id, 'new guy has id');

            request.get(root + 'folks/' + new_guy_json._id,
                function (err, res, body) {
                    var new_guy_json2 = JSON.parse(body);
                    test.deepEqual(new_guy_json2, new_guy_json, 'new guy get');
                    test.done();
                });
        })
    },

    test_home_response:function (test) {
        request('http://localhost:3334/', function (err, response, body) {

            if (err) {
                framework.server().close();
                throw err;
            }
            test.equal(body, fs.readFileSync(app_path + '/controller_home/actions/home/home_view.html').toString(), 'returning view');

            console.log('server closing to %s ', framework.config.port);
           framework.server().close();
            mongoose.connection.close();
            test.done();
        })
    }
}
