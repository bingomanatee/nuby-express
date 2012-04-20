var Framework = require('../lib/Framework');
var path = require('path');
var _ = require('underscore');
var util = require('util');

var framework;

var app_path = path.resolve(__dirname + '/../test_resources/Resources_Test/app');

function _ss(a) {
    return _.sortBy(a, function (i) {
        return i
    });
}

function _1(a){
    return _.map(a, function(aa){ return aa[0]});
}

module.exports = {
    setup: function(test){
        framework = new Framework({path: app_path});

        framework.start_load(function(){

           // console.log('RT setup done');
            test.done();
        }, app_path);
    },

    test_server_load: function(test){
        framework.on('load_done', function(){
            test.ok(!(framework.hasOwnProperty('abc')),
                       'framework doesn\'t have alpha on load done');
        });

        framework.start_server(function(){
           framework.log_report().forEach(function(lr){
             //   console.log(lr[0]);
            })

            test.deepEqual(framework.alpha, 'abc'.split(''), 'framework has alpha after start_server');
            test.deepEqual(framework.def, 'def'.split(''), 'framework has def after start_server');
            var hn = handler_names(framework);
          //  console.log('handlers: [%s]', hn.join(','));
            test.ok(_.contains(hn, 'logger', 'framework server has logger'));
            test.done();
        })
    }
}

function handler_names(framework){
    if (framework.hasOwnProperty('_server')){
        return _.map(framework._server.stack, function(item){
            return item.handle.name;
        });
    } else {
        return [];
    }
}