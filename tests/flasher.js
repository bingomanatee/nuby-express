var util = require('util');
var Loader = require('./../lib/loader');
var Framework = require('./../lib/framework');
var path = require('path');
var fs = require('fs');
var request = require('./../node_modules/request');

var loader;
var fw;

module.exports = {
    setup:function (test) {
        fw = new Framework(path.resolve('./test_resources/flasher_app'));

        loader = new Loader();

        function _on_loaded_cb() {
            console.log('flasher setup loaded');
            fw.app.listen(3010);
            test.done();
        }

        loader.load(fw, _on_loaded_cb);
    },

    test_loader:function (test) {
        console.log('loading home/bar');
        request('http://localhost:3010/home/bar', function (error, response, body) {
            test.equals(body, '<html><body><div id="info">bar</div>body of bar</body></html>', 'flash bar body response');

            request('http://localhost:3010/home/foo', function (error, response, body) {
                test.equals(body, '<html><body><div id="info">foo</div><div id="error">bar</div>body of foo</body></html>', 'flash foo body response');

                request('http://localhost:3010/home/secure', function (error, response, body) {
                    test.equals(body, '<html><body><div id="error">login required</div>home</body></html>', 'flash secure body response');

                    test.done();
                    fw.app.close();
                });
            });
        });

    }

}