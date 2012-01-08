var RestAction = require('./index');
var _ = require('../../node_modules/underscore');
var path = require('path');
var util = require('util');
var init = require('./../action/init');

function RestGetAction(config) {
    init(this, config);
}

_.extend(RestGetAction.prototype, RestAction.prototype, {

    path: {
        view_path: false
    },

    execute:function (req_state, callback) {
        var self = this;

        function _on_record(err, record){

            if (record && self.data_context){
                record = self.data_context(record);
            }
            callback(err, record);
        }

        function _on_id( id) {
            console.log('id retrieved: %s', id);
            self.get_model().get(id, _on_record);
        }

        function _on_err() {
            throw new Error('no id in request');
        }

        req_state.get_param(['input','id'], _on_id, _on_err);
    },

    id_param: 'id',

    /**
     * override this method if you want to add an envelope to the data JSON.
     * @param data: object
     * @return object
     */
    data_context:function (data) {
        return data;
    },

    method: 'get',

    name: 'get',

    get_route: function(){
        return util.format('%s/:%s.:format?', this.controller.get_route(),  this.id_param);
    }

});

module.exports = RestGetAction;