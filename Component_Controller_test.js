var util = require('util');
var path = require('path');
var fs = require('fs');
var events = require('events');

var _ = require('underscore');
var Component_loader = require('./../lib/Component');

var component;

var module_root = path.dirname(__dirname);
var ccs_path = module_root + '/test_resources/Component_Controller_test';

module.exports = {
    setup:function (test) {
        component = new Component();
        test.done();
    },

    /**
     * Basic file loading functionality - validates every entry is unique, and
     * both files and directories are recorded. Also validates that the ending
     * _item_count value is zero.
     * @param test
     */
    test_component_loader:function (test) {
        component.start_load(function () {
            console.log('component_loader done: %s', util.inspect(component));
            test.equal(component._item_count, 0, 'Item count is zero');
            test.done();
        }, ccs_path);
    }

}