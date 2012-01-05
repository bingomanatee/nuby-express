var util = require('util');
var Loader = require('./../lib/loader');
var Framework = require('./../lib/framework');
var path = require('path');
var fs = require('fs');
var request = require('./../node_modules/request');
var querystring = require('querystring');
var loader;
var fw;

module.exports = {
    setup:function (test) {
        fw = new Framework(path.resolve('./test_resources/session_app'));

        loader = new Loader();

        function _on_loaded_cb() {
            fw.start(3008);
            test.done();
        }


        loader.load(fw, _on_loaded_cb);
    },

    test_param:function (test) {
        request('http://localhost:3008/', function (err, response, body) {
                test.equals(body, '<html><body>id:0</body></html>', 'pre session ID');

                request.post({url:'http://localhost:3008/login',
                        form:{id:10}
                    },
                    function (err, response, body) {
                        request('http://localhost:3008/', function (err, response, body) {
                            test.equals(body, '<html><body>id:10</body></html>', 'post session ID');


                            request.get({url:'http://localhost:3008/logout',
                                    form:{id:10}
                                },
                                function (err, res, body) {


                                    request('http://localhost:3008/', function (err, response, body) {
                                        test.equals(body, '<html><body>id:0</body></html>', 'post logout ID');

                                        test.done();
                                        fw.app.close();
                                    });
                                });


                        });
                    });
            }
        );
    }
}