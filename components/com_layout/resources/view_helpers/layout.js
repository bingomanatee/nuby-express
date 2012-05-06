var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');
var _DEBUG = false;

var _layout_view = new NE.helpers.View({
    name:'layout_seletor',

    init:function (rs, input, cb) {

        function _fetch_layout(key) {
            console.log('desiring layout %s', key);
            var layout = rs.framework.get_resource('layout', key);
            if (layout) {
                if (_DEBUG) console.log('found layout %s: template = %s', key, layout.template);
                input.layout = layout.template;
            } else {
                throw new Error('cannot find layout %s', key);
            }
        }

        if (_DEBUG) console.log('input for layout view: %s', util.inspect(input));

        if (input.hasOwnProperty('layout_name')) {
            _fetch_layout(input.layout_name);
        } else {
            ln = rs.action.get_config('layout_name', 'NO LAYOUT')

            if (ln != 'NO LAYOUT') {
                if (ln) {
                    _fetch_layout(ln);
                } else {
                    input.layout = false;
                }
            }
        }

        cb(null, this.name);
    }

});

module.exports = function () {
    return _layout_view;
}