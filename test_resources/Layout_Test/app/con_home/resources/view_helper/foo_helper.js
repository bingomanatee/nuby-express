var NE = require("nuby-express");
var util = require('util');
var _foo_helper = new NE.helpers.View({
    name: 'foo2_helper',
    weight: 0,

    init: function(rs, input, cb){
        if(input.foo){
            input.foo.a = 4;
        } else {
            console.log('no foo in %', util.inspect(input));
        }
        cb();
    }

});

module.exports = function(){
    return _foo_helper;
}