var util = require('util');
var path = require('path');

var _ = require('underscore');
var Controller = require('./../lib/Controller');
var Component = require('./../lib/Component');
var Framework = require('./../lib/Framework');

var component;
var controller;

var module_root = path.dirname(__dirname);
var framework_path = module_root + '/test_resources/Component_Controller_test/app';
var component_path = framework_path + '/component_bar';
var controller_path = component_path + '/controllers/con_alpha';

function _ss(a) {
    return _.sortBy(a, function (i) {
        return i
    });
}
var framework_com_con;
var framework_con_direct;
var framework_con_all;
var com_controllers;
var controller_actions;
var controller_loader_actions;
var fr_con_her;
module.exports = {
    setup:function (test) {
        framework_com_con = _ss([
            'alpha',
            'beta',
            'gamma',
            'alpha2',
            'beta2'
        ]);
        framework_con_direct = _ss(['direct']);
        framework_con_all = _ss(framework_com_con.concat(framework_con_direct));
        com_controllers = _ss([
            'alpha',
            'beta',
            'gamma'
        ]);
        controller_actions = _ss(['bar', 'foo']);
        controller_loader_actions = _ss([
            'alpha:bar',
            'alpha:foo'
        ]);
        fr_con_her = _ss([
            'app:bar:alpha',
            'app:bar:beta',
            'app:bar:gamma',
            'app:foo:alpha2',
            'app:foo:beta2',
            'app:direct'
        ]);

        component = new Component({path:component_path});
        controller = new Controller({path:controller_path});
        console.log('CCT setup done');
        component.start_load(function () {
            test.done();
        }, component_path);
    },

    test_component_loader:function (test) {
        test.equal(component._item_count, 0, 'Item count is zero');
        test.deepEqual({com_bar_foo:3, com_bar_vey:2}, component.config, 'loading component configuration');
        test.deepEqual(com_controllers, _ss(component.controller_names()), 'controllers found');
        test.equal(component.heritage(), 'bar', 'component heritage');
        test.done();
    },

    test_controller_loader:function (test) {
        controller.start_load(function () {
            test.deepEqual(controller_actions, _ss(controller.action_names()), 'controller action nanes');
            test.equal(controller.heritage(), 'alpha', 'controller heritage');
            var action_h = _ss(_.map(controller.actions, function (a) {
                return a.heritage();
            }));

            test.deepEqual(controller_loader_actions, action_h, 'action heritages');
            test.done();
        }, controller_path);
    },

    test_framework_loader:function (test) {
        //   console.log('--- LOADING FRAMEWORK %s --', framework_path);
        var fr = new Framework({path:framework_path  });
        fr.start_load(function () {

            test.equal(fr._item_count, 0, 'Item count is zero');
            test.deepEqual({port:80, framework_foo:1, framework_bar:2 }, fr.config,
                util.format('loading framework configuration of framework %s', fr.path));
            test.deepEqual(framework_com_con,
                _ss(fr.com_controller_names()), 'component controllers found');
            test.deepEqual(framework_con_direct,
                _ss(fr.controller_names(false)), 'direct controllers found');
            test.deepEqual(framework_con_all,
                _ss(fr.controller_names(true)), 'ALL controllers found');
            test.deepEqual(fr_con_her,
                _ss(fr.controller_heritage(true)), 'framework controller heritage');

            test.done();

        }, framework_path);
    }

}