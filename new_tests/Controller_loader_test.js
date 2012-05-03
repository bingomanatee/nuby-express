var Framework = require('./../lib').Framework;
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var framework;
var logger = require('./../lib/utility/logger');

var app_path = path.resolve(__dirname + '/../test_resources/Controller_test/app');

module.exports = {
    setup:function (test) {
        logger.init(__dirname + './../test_reports/Controller_loader_test/log.json');
        framework = new Framework({path:app_path});
        test.done();
    },

    test_no_abc: function(test){
        framework.start_load(function () {
            framework.log('Framework laoded');
            console.log("ALL DONE LADING FRAMEWORK!");
            logger.log({msg: 'Final Framework', frame: framework.to_JSON()});
            process.nextTick(function(){
                test.done();
            })
        }, app_path);
    }
};