var _ = require('underscore');

function View_Helper(config) {
    _.extend(this, config);
}

_.extend(View_Helper.prototype, {

    type: 'view_helper',

    on_add:function (frame, cb) {
        this._framework = frame;
        cb();
    },

    on_req_state:function (rs) {
        this._req_state = rs;
    }
});

module.exports = View_Helper;