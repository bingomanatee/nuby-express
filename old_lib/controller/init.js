var _ = require('../../node_modules/underscore');

module.exports = function(controller, config){
    var old_params = controller.params;
    controller.params = {};
    _.extend(controller, config);
    _.defaults(controller.params, old_params);
}