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
        fw = new Framework(path.resolve('./test_resources/simple_app'));

        test.equals(0, fw.controllers.length, 'simple framework has no controllers');

        loader = new Loader();

        function _on_loaded_cb() {
            fw.app.listen(3002);
            test.done();
        }

        loader.set_404(fw);

        loader.load(fw, _on_loaded_cb);
    },

    test_loader:function (test) {

        request('http://localhost:3002', function (error, response, body) {
            test.equals(body, '<html><body>Welcome to Test Site</body></html>', 'body response');

            request('http://localhost:3002/no_page_here', function (err, response, body) {
               // console.log('response: %s', util.inspect(response));
                test.equals(response.statusCode, 404, 'no page here has 404 code');
                test.equals(body, '<html><body>Page Not Found</p></body></html>', 'no page here has not found body');
                test.done();
                fw.app.close();
            })
        });

    }

}