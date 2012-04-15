var util = require('util');
var path = require('path');

var _ = require('underscore');
var Component = require('./../lib/Component');
var Framework = require('./../lib/Framework');

var component;

var module_root = path.dirname(__dirname);
var framework_path = module_root + '/test_resources/Component_Controller_test/app';
var controller_path = framework_path + '/component_bar';

function _ss(a) {
    return _.sortBy(a, function (i) {
        return i
    });
}
var framework_com_controllers;
var framework_controllers_direct;
var framework_cotrollers_all;

module.exports = {
    setup:function (test) {
        framework_com_controllers = _ss([ '<<controller>>alpha', '<<controller>>beta', '<<controller>>gamma', '<<controller>>alpha2', '<<controller>>beta2' ]);
        framework_controllers_direct = _ss(['<<controller>>direct']);
        framework_cotrollers_all = _ss(framework_com_controllers.concat(framework_controllers_direct));
        component = new Component({path:controller_path});
        test.done();
    },

    test_component_loader:function (test) {
        console.log(' -- TEST COMPONENT LOADER --');

        component.start_load(function () {
            test.equal(component._item_count, 0, 'Item count is zero');
            test.deepEqual({com_bar_foo:3, com_bar_vey:2}, component.config, 'loading component configuration');
            test.deepEqual(_ss([ '<<controller>>alpha', '<<controller>>beta', '<<controller>>gamma' ]), _ss(component.controller_names()), 'controllers found');
            test.done();
        }, controller_path);
    },


    test_framework_loader:function (test) {
        //   console.log('--- LOADING FRAMEWORK %s --', framework_path);
        var fr = new Framework({path:framework_path  });
        fr.start_load(function () {

            test.equal(fr._item_count, 0, 'Item count is zero');
            test.deepEqual({ framework_foo:1, framework_bar:2 }, fr.config,
                util.format('loading framework configuration of framework %s', fr.path));
            test.deepEqual(framework_com_controllers,
                _ss(fr.com_controller_names(true)), 'controllers found');
            test.deepEqual(framework_controllers_direct,
                _ss(fr.controller_names(false)), 'controllers found');
            test.deepEqual(framework_cotrollers_all,
                _ss(fr.controller_names(true)), 'ALL controllers found');

            test.done();

        }, framework_path);
    }

}