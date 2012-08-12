var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');

var _js_view = new NE.helpers.View( {
    name: 'flash',

    init: function(rs, input, cb){
        input.javascript = _.uniq(rs.action.get_config('javascript', [], true));
        cb(null, this.name);
    }

});

module.exports = function () {
    return _js_view;
}