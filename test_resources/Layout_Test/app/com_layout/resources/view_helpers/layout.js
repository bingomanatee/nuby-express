var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');

var _layout_view = new NE.helpers.View( {
    name: 'layout_seletor',

    init: function(rs, input, cb){
        if (input.hasOwnProperty('layout_name')){
            if (input.layout_name){
                rs.framework.get_resource('layout', input.layout_name);
            } else {
                input.layout = false;
            }
        }
        cb(null, this.name);
    }

});

module.exports = function () {
    return _layout_view;
}