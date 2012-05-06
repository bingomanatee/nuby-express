var util = require('util');
var path = require('path');
var fs = require('fs');
var events = require('events')
var _ = require('underscore');
var module_root = path.dirname(__dirname);
var app_path = module_root + '/test_resources/Layout_Test/app';
var NE = require(module_root + '/lib')
var framework;

module.exports = {
    test_setup:function (test) {
        framework = new NE.Framework({path: app_path});
        framework.start_load(function(){
           framework.start_server(function(){
                test.done()
            })
        })
    },

    test_layout:function (test) {
        var layout_names = _.pluck(framework.get_resources('layout'), 'name');
        layout_names = _.sortBy(layout_names, _.identity);
        test.deepEqual(layout_names, ['foo']);
        test.done();
    }

}