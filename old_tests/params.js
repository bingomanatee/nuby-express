var util = require('util');
var Loader = require('../../lib/loader');
var Framework = require('../../lib/framework');
var path = require('path');
var fs = require('fs');
var request = require('../../node_modules/request');

var loader;
var fw;

module.exports = {
    setup:function (test) {
        fw = new Framework(path.resolve('./test_resources/simple_app'));

        test.equals(0, fw.controllers.length, 'simple framework has no controllers');

        loader = new Loader();

        function _on_loaded_cb() {
            fw.app.listen(3004);
            test.done();
        }


        loader.load(fw, _on_loaded_cb);
    },

    test_param: function (test) {
        request('http://localhost:3004/basic/pt1', function(err, response, body){
            test.equals(body, '<html><body>1</body></html>', 'pt1 body');
            test.done();
            fw.app.close();
        });
    }

}