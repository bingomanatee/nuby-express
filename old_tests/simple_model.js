var SimpleModel = require('../../lib/simple_model');
var util = require('util');

var model;
module.exports = {
    setup:function (test) {

        model = new SimpleModel({}, [
            {id:1, name:'Bob', gender:'M', age:20},
            {id:2, name:'Bill', gender:'M', age:50},
            {id:3, name:'Sue', gender:'F', age:20},
            {id:4, name:'Ginger', gender:'F', age:30},
            {id:5, name:'Lisa', gender:'F', age:10}
        ]);

        test.done();
    },

    count_records:function (test) {

        model.count(function (err, c) {
                test.equals(c, 5, 'start with 5 records');

                function cb(err, out) {
                    test.equals(out.id, 6, 'new id == 6');

                    model.count(function (err, c) {
                        test.equals(c, 6, 'after put has 6 records');
                        model.get(2, function (err, obj) {

                            test.equals(obj.name, 'Bill', 'object 2 name = bill');

                            function cb2(err, records) {
                                test.equals(4, records.length, 'four females');
                            }

                            model.find({gender:'F'}, cb2);

                            model.del(2, function (err, bill) {
                                test.equals(bill.name, 'Bill', 'deleted record 2 == bill');
                                model.count(function (err, c) {
                                    test.equals(c, 5, 'back to 5 records');

                                    test.done();
                                });
                            });

                        });
                    });
                }

                model.put({name:'Betty', gender:'F', age:40}, cb)
            }
        );
    }

}