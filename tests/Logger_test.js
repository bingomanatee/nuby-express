var util = require('util');
var path = require('path');
var fs = require('fs');
var events = require('events');

var _ = require('underscore');
var logger = require('./../lib/utility/logger');

var log_path;
var foo_msg = {foo:1};
var bar_msg = {bar:2};

module.exports = {
    setUp:function (cb) {
        log_path = __dirname + '/../test_reports/Logger_tests/log.json';
        logger.set_log_file(log_path, {reset:true});
        setTimeout(cb, 500);
    },

    test_logger:function (test) {
        logger.log('foo', foo_msg);
        logger.log('bar', bar_msg);

        function _notime(d){
            delete d.time;
            return d
        }

        setTimeout(function () {
            logger.log_to_obj(function (err, content) {
                console.log('content: %s (%s)', util.inspect(content), typeof content);
                test.deepEqual([
                    { task:'foo', content:{ foo:1 } },
                    { task:'bar', content:{ bar:2 } },
                    { task:'end' }]
                , _.map(content, _notime), 'content of log');
                test.done();
            })

        }, 200);
    }

};