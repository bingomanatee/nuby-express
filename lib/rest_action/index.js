var Action = require('./../action');
var _ = require('../../node_modules/underscore');
var init = require('./../action/init');

function RestAction(config) {
    init(this, config);
}

_.extend(RestAction.prototype, Action.prototype, {

    view_path: false,

    load_req_params:'input',

    get_model:function () {
        return _.isFunction(this.controller.model) ? this.controller.model() : this.controller.model;
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

    parse_rest_input: function(body){
      if (_.isString(body)){
          body = JSON.parse(body);
      };

        if (body.hasOwnProperty(this.name)){
            return body[this.name];
        }
        return body;
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