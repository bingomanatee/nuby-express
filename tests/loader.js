var util = require('util');
var Loader = require('./../lib/loader');
var Framework = require('./../lib/framework');
var path = require('path');
var fs = require('fs');

var loader;
var framework;

module.exports = {
    setup:function (test) {
        framework = new Framework(path.resolve('./test_resources/loader_app'));

        test.equals(0, framework.controllers.length, 'framework has no controllers');

        loader = new Loader();
        test.done();
    },

    test_loader:function (test) {
        function _on_loaded_cb() {
            test.equals(1, framework.controllers.length, 'framework has one controller');
            if (framework.controllers.length > 0) {
                var c = framework.controllers[0];
                test.ok(c.actions.hasOwnProperty('main'), 'frameworks controller main action');
                if (c.actions.hasOwnProperty('main')) {
                    var a = c.actions.main;
                    test.equals('/', a.get_route(), 'main action route = /');
                }

                test.ok(c.actions.hasOwnProperty('about_us'), 'frameworks controller about_us action');
                if (c.actions.hasOwnProperty('about_us')){
                    var a = c.actions.about_us;
                    test.equals('/home/about_us', a.get_route(), 'about_us action route = /home/about_us');
                }
            }
            test.done();
        }

        loader.load(framework, _on_loaded_cb);
    }

}