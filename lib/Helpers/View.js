var _ = require('underscore');

function View_Helper(config) {
    _.extend(this, config);
}

_.extend(View_Helper.prototype, {

    type:'view_helper',

    weight: 0,

    on_add:function (frame, cb) {
        this._framework = frame;
        cb();
    },

    ini:function (rs, input, cb) {

    }
})
;

module.exports = View_Helper;