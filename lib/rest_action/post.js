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

        function _on_record(err, record) {
             console.log('record for post is %s', util.inspect(record));
            if (self.format_rest_output) {
                record = self.format_rest_output(err, record);
                callback(null, record);
            } else {
                self.error(req_state, err);
            }
        }

        var body = req_state.req.body;

        console.log('post: body = %s', util.inspect(body));
        var model = self.get_model();
        var record = body;

        if (record.hasOwnProperty(self.id_param)) {
            self.error(new Error(
                util.format('post with record that already has %s (%s)',
                    self.id_param, record[self.id_param])));
        } else {
            self.get_model().put(record, _on_record);
        }

    },

    id_param:'id',

    method:'post',

    name:'post',

    get_route:function () {
        return util.format('%s/:id.:format?', this.controller.get_route(), this.id_param);
    }

});

module.exports = RestPutAction;