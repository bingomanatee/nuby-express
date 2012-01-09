var RestAction = require('./index');
var _ = require('../../node_modules/underscore');
var path = require('path');
var util = require('util');
var init = require('./../action/init');

/**
 * Update a record keyed by ID
 * @param config
 */

function RestPutAction(config) {
    init(this, config);
}

_.extend(RestPutAction.prototype, RestAction.prototype, {

    path:{
        view_path:false
    },

    execute:function (req_state, callback) {
        var self = this;

        function _on_id(id) {
            var model = self.get_model();
            var record = body;
            record[self.id_param] = id;

            function _on_record(err, record) {
                if (self.format_rest_output) {
                    record = self.format_rest_output(err, record);
                    callback(null, record);
                } else {
                    self.error(req_state, err);
                }
            }

            self.get_model().put(record, _on_record);
        }

        function _on_err() {
            self.error(req_state, new Error('no id in request'));
        }

        var body = req_state.req.body;
       // console.log('record for put is %s', util.inspect(body));
        req_state.get_param(['input', 'id'], _on_id, _on_err);
    },

    id_param:'id',

    method:'put',

    name:'put',

    get_route:function () {
        return util.format('%s/:%s.:format?', this.controller.get_route(), this.id_param);
    }

});

module.exports = RestPutAction;