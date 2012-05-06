var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');

var _layout_view = new NE.helpers.View( {
    name: 'layout_seletor',

    init: function(rs, input, cb){
      //  console.log('input for layout view: %s', util.inspect(input));
        if (input.hasOwnProperty('layout_name')){
            if (input.layout_name){
                console.log('desiring layout %s', input.layout_name);
                var layout = rs.framework.get_resource('layout', input.layout_name);
                if (layout){
                    input.layout = layout.template;
                } else {
                    throw new Error('cannot find layout %s', input.layout_name);
                }
            } else {
                input.layout = false;
            }
        } else if (rs.action.config.hasOwnProperty('layout_name')){
            if (rs.action.config.layout_name){
                console.log('desiring layout %s', rs.action.config.layout_name);
                var layout = rs.framework.get_resource('layout', rs.action.config.layout_name);
                if (layout){
                    input.layout = layout.template;
                } else {
                    throw new Error('cannot find layout %s', rs.action.config.layout_name);
                }
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