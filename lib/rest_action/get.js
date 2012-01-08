var RestAction = require('./index');
var _ = require('../../node_modules/underscore');
var path = require('path');
var util = require('util');
var init = require('./../action/init');

function RestGetAction(config) {
    init(this, config);
}

_.extend(RestGetAction.prototype, RestAction.prototype, {

    path:{
        view_path:false
    },

    execute:function (req_state, callback) {
        var self = this;

        function _on_id(id) {
            function _on_record(err, record) {

                if (self.format_rest_output) {
                    record = self.format_rest_output(err, record);
                    callback(null, record);
                } else {
                    self.error(req_state, err);
                }
            }

            self.get_model().get(id, _on_record);
        }

        function _on_err() {
            throw new Error('no id in request');
        }

        req_state.get_param(['input', 'id'], _on_id, _on_err);
    },

    id_param:'id',

    method:'get',

    name:'get',

    get_route:function () {
        return util.format('%s/:%s.:format?', this.controller.get_route(), this.id_param);
    }

});

module.exports = RestGetAction;