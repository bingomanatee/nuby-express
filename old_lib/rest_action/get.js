var RestAction = require('index.js');
var _ = require('../../node_modules/underscore');
var path = require('path');
var util = require('util');
var init = require('../action/init.js');

function RestGetAction(config) {
    init(this, config);
}

_.extend(RestGetAction.prototype, RestAction.prototype, {

    view_path:false,
    params:{
    },

    execute:function (req_state, callback) {
        var self = this;

        function _on_id(err, id) {
        //    console.log('err: %s, id: %s', err, id);
            function _on_record(err, record) {
             //   console.log('get record: %s', util.inspect(record));
                if (self.format_rest_output) {
                    record = self.format_rest_output(err, record);
                    callback(null, record);
                } else {
                    self.error(req_state, err);
                }
            }

         //   console.log('GET REST ID = %s', id);

            self.get_model().get(parseInt(id), _on_record);
        }

        function _on_err() {
            throw new Error('no id in request');
        }

       // console.log('GET req_state params: %s', util.inspect(req_state.params, null, 1));

        req_state.get_param(['input', 'id'], _on_id, _on_err);
    },

    id_param:'id',

    method:'get',

    name:'get',

    get_route:function () {
        return this.route ? this.route : util.format('%s/:%s.:format?', this.controller.get_route(), this.id_param);
    }

});

module.exports = RestGetAction;