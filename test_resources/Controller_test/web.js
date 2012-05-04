var Framework = require('./../../lib').Framework;
var path = require('path');
var _ = require('underscore');
var util = require('util');
var request = require('request');
var fs = require('fs');
var framework;
var logger = require('./../../lib/utility/logger');

var app_path = path.resolve(__dirname + '/app');

//logger.init(__dirname + './../../test_reports/Controller_loader_test/log.json');
framework = new Framework({path:app_path});

framework.start_load(function () {
    framework.log('Framework loaded');
    console.log("ALL DONE LADING FRAMEWORK!");
    logger.log({msg:'Final Framework', frame:framework.to_JSON()});
}, app_path);
