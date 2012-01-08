var util = require('util');
var nuby_express = require('../lib');
var request = require('../node_modules/request');
var loader;
var fw;
var path = require('path');

module.exports = {
    setup:function (test) {
        fw = new nuby_express.Framework(path.resolve('./test_resources/rest_app'));
        loader = new nuby_express.Loader();

        function _on_loaded_cb() {
            fw.start(3010);
            test.done();
        }

        loader.load(fw, _on_loaded_cb);
    },

    test_param:function (test) {
        request('http://localhost:3010/dogs/2.json', function (err, response, body) {
            test.equals(body, '{"name":"Spot","id":2,"gender":"F"}', 'gotten rest');

            test.done();
            fw.app.close();
        });
    }
}