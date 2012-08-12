var NE = require("nuby-express");

var _foo_helper = new NE.helpers.View({
    name: 'foo_helper',
    weight: -1,

    init: function(rs, input, cb){
        input.foo = {a: 1, b: 2, c: 3};
        cb();
    }

});

module.exports = function(){
    return _foo_helper;
}