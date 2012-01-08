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
    }

});

module.exports = RestAction;