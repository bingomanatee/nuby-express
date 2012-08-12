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
        framework = new Framework({path:app_path});
        test.done();
    },

    load_controller_files:function (test) {
        framework.start_load(function () {
            framework.log('Framework loaded');
            console.log("ALL DONE LADING FRAMEWORK!");
            logger.init(__dirname + './../test_reports/Controller_loader_test/log.json');
            test.deepEqual(['beta', 'direct'], _.map(framework.controller_names(), _.identity));
            test.done();
        }, app_path);

        /*   var i = setInterval(function(){
         if (framework.load_done){
         clearInterval(i);
         }
         }, 200); */
    }
};