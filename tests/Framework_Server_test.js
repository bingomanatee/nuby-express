var Framework = require('../lib/Framework');
var path = require('path');
var _ = require('underscore');

var framework;

var app_path = path.resolve(__dirname + '/../test_resources/FS_test/app');

var fw_log_msgs;

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

        fw_log_msgs = _ss(['action <<action>>bar added route /bar/alpha/bar',
        'action <<action>>foo added route /bar/alpha/foo']);

        framework.start_load(function(){
        //    console.log('FS setup done');
            test.done();
        }, app_path);
    },

    test_server_load: function(test){
        framework.start_server(function(){
           // console.log('server started: log = %s', framework._log.join("\n"));
            test.deepEqual(fw_log_msgs, _ss(_1(framework._log)), 'all actions logged');
            test.done();
        })
    }
}