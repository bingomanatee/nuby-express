var Framework = require('./../lib').Framework;
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var framework;

var app_path = path.resolve(__dirname + '/../test_resources/Resources_Test/app');

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
        test.done();
    },

    test_no_abc: function(test){
        framework.on('load_done', function () {
            test.ok(!(framework.hasOwnProperty('abc')),
                'framework doesn\'t have alpha on load done');
        });

        framework.start_load(function () {
            var report = JSON.stringify(framework.to_JSON());
            fs.writeFile(path.normalize(__dirname + './../test_reports/Resources_test/' + new Date().getTime() + '.json'), report, function(){
                test.done();
            });
        }, app_path);
    },

    test_server_load:function (test) {

        framework.start_server(function () {

            test.deepEqual(framework.alpha, 'abc'.split(''), 'framework has alpha after start_server');
            test.deepEqual(framework.def, 'def'.split(''), 'framework has def after start_server');
            var hn = handler_names(framework);
            //
            test.ok(_.contains(hn, 'logger', 'framework server has logger'));
            framework.server().listen(framework.config.port);
            test.done();
        })
    },

    test_widget_post:function (test) {
        request.post({uri:'http://localhost:3332/alpha/mega/foo', form:{name:"quux"}},
            function (err, res, body) {
                if (err){
                    throw err;
                }
            if (!body) body = '';
                try {
                    test.deepEqual({id: 4, name: "quux"}, JSON.parse(body), 'new widget');
                } catch (err){
                    test.ok(false, 'cannot parse ' + body);
                }
           //     framework.server().close();
                test.done();

            });
    }
}

function handler_names(framework) {
    if (framework.hasOwnProperty('_server')) {
        return _.map(framework._server.stack, function (item) {
            return item.handle.name;
        });
    } else {
        return [];
    }
}