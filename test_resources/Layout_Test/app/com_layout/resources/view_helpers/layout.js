var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

var _layout_view = new NE.helpers.View({
    name:'layout_seletor',

    init:function (rs, input, cb) {
        if (_DEBUG) console.log('INIT LAYOUT');

        function _fetch_layout(key) {
            if (key == false) {
                input.layout = false;
            } else {
             //   console.log('desiring layout %s', key);
                var layout = rs.framework.get_resource('layout', key);
                if (layout) {
                    if (_DEBUG) console.log('found layout %s: template = %s, path = %s'
                        , key, layout.template, rs.req.url);
                    input.layout = layout.template;
                } else {
                    throw new Error('cannot find layout %s', key);
                }
            }
        }

        if (_DEBUG) console.log('input for layout view: %s', util.inspect(input));

        if (input.hasOwnProperty('layout_name')&& input.layout_name) {
            if (_DEBUG) console.log('INIT LAYOUT: looking for layout (from input choice) %s', input.layout_name);
            _fetch_layout(input.layout_name);
        } else {
            ln = rs.action.get_config('layout_name', 'NO LAYOUT')
            if (_DEBUG) console.log('INIT LAYOUT: looking for layout %s', ln);

            if (ln != 'NO LAYOUT') {
                if (_DEBUG) {
 // console.log('found layout %s for %s', ln, rs.req.url)
                }

                if (ln) {
                    _fetch_layout(ln);
                } else {
                    input.layout = false;
                }
            }
        }

       if (_DEBUG){
 // console.log('PATH: %s, LAYOUT: %s <<<<<<<<<', rs.req.url, input.layout);
       }

        cb(null, this.name);
    }

});

module.exports = function () {
    return _layout_view;
}