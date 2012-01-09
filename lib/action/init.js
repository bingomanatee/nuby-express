var _ = require('./../../node_modules/underscore');
var prop_extend = require('./../req_state/prop_extend');

module.exports = function(action, config){
    var old_params = action.params;
    action.params = {};
    _.extend(action, config);
    prop_extend(action.params, old_params);
    prop_extend(action.controller.params, action.params);

    if (action.journal_states) {
        action.req_journal = [];
    }
}