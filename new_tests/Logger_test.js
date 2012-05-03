var util = require('util');
var path = require('path');
var fs = require('fs');
var events = require('events');

var _ = require('underscore');
var logger = require('./../lib/utility/logger');

var log_path;
var foo_msg;
var bar_msg;

module.exports = {
    setup:function (test) {
        log_path = __dirname + '/../test_reports/Logger_tests/log.json';
        logger.init(log_path);
        test.done();
        foo_msg = {foo:1};
        bar_msg = {bar:2};
    },

    test_logger:function (test) {
        logger.log(foo_msg);
        logger.log(bar_msg);
        test.done();
    },

    test_logger_output:function (test) {
        fs.readFile(path.normalize(log_path), 'utf8', function(err, contents){
            if (err){
                throw err;
            }
            console.log('log = %s', contents);
            test.equal(contents, JSON.stringify([foo_msg, bar_msg]), 'contents equal JSON.');
            test.done();
        });
    }

};