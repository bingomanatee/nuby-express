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
            loader.set_404(fw);
            fw.start(3010);
            test.done();
        }


        loader.load(fw, _on_loaded_cb);

    },

    test_param:function (test) {
        request('http://localhost:3010/dogs/2.json', function (err, response, body) {
            test.equals(body, '{"name":"Spot","id":2,"gender":"F"}', 'gotten rest');

            request('http://localhost:3010/dogs/210.json', function (err, response, body) {
                //  console.log('tp err: %s', util.inspect(err));
                test.equals(body, '{"error":"cannot find key 210"}', 'asking for nonexistent record');
                test.equals(response.statusCode, 200, 'status 200 for missing reord');

                var new_dog = {name:'Benji', gender:'M'};
                request.put({url:'http://localhost:3010/dogs/50.json',
                        json:new_dog},

                    function (err, response, body) {
                     //  console.log('put out body: %s (%s)', util.inspect(body), typeof body);
                        test.deepEqual({name:'Benji', gender:'M', id:'50'}, body, 'benji is 50');
                        var lassie = {name:'Lassie', gender:'F'};

                        request.post({url:'http://localhost:3010/dogs/0.json',
                                json:lassie},

                            function (err, response, body) {
                                lassie.id = '51';
                              //  console.log('response to lassie post: %s', util.inspect(response, null, 1));
                                test.deepEqual(lassie, body, 'lassie is 51');
                                test.done();
                                fw.app.close();
                            });


                    });
            });
        });
    }
}