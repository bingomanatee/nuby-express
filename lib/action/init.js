var _ = require('./../../node_modules/underscore');

module.exports = function(action, config){
    var old_params = action.params;
    action.params = {};
    _.extend(action, config);
    _.defaults(action.params, old_params);

    if (action.journal_states) {
        action.req_journal = [];
    }
}