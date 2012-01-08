var Action = require('./../action');
var _ = require('../../node_modules/underscore');
var init = require('./../action/init');

function RestAction(config) {
    init(this, config);
}

_.extend(RestAction.prototype, Action.prototype, {

    load_req_params:'input',

    get_model:function () {
        return this.controller.model;
    },

    /**
     * override this method if you want to add an envelope to the data JSON.
     * @param data: object
     * @return object
     */
    format_rest_output:function (err, data) {
        if (err) {
            return {error:err.message};
        } else {
            return data;
        }
    },

    error:function (req_state, err) {
        //   console.log('error in get');
        // req_state.res.statusCode = 204;

        var record;

        if (this.format_rest_output) {
            record = this.format_rest_output(err);
        } else {
            record = {error:err.message}
        }

        //   console.log('error sending %s', util.inspect(record));
        req_state.set_param('render', record, 'error');
        req_state.send();
    }


});

module.exports = RestAction;