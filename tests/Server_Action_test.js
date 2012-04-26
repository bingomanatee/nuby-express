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

module.exports = {
    setup:function (test) {
        framework = new Framework({path:app_path});

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
            test.equal(framework.config.port, 3333, 'port is 3333');
            framework.server().listen(framework.config.port);

            test.done();
        })
    },

    test_prop_response:function (test) {
        request('http://localhost:3333/foo/bar/4', function (err, res, body) {

            test.equal(body, '<html><body>id:4,n:3</body></html>', 'parameter passing');
            test.done();
        });
    },

    test_post_response:function (test) {
        request({uri:'http://localhost:3333/foo/bar', method:'POST', form:{n:1000, notes:"obrien home"}},
            function (err, res, body) {
                test.equal(body, '<html><body>id:1,n:1000,notes:obrien home</body></html>', 'parameter passing');
                test.done();
            }
        )
    },

    test_default_route:function (test) {
        request.get(root + 'foo/foo', function (er, re, body) {
            test.equal(body, '<html><body>foo</body></html>', 'testing default route');
            test.done();
        });
    },

    test_home_response:function (test) {
        request(root, function (err, response, body) {
            if (err) {
                throw err;
            }
            test.equal(body, fs.readFileSync(app_path + '/controller_home/actions/home/home_view.html').toString(), 'returning view');
           //framework.server().close();
            test.done();

        })
    }
}
