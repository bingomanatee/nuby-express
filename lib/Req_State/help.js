var _ = require('underscore');
var Gate = require('support/gate');

module.exports = function (input, cb) {
    var view_helpers = this.framework.get_resources('view_helper');
    if (!view_helpers.length){
      return cb();
    }
    //  console.log('resources: %s', util.inspect(this.framework, true, 0));
    view_helpers = _.sortBy(view_helpers, function(h){
       return h.weight ? h.weight : 0;
    });
 //   console.log('%s view helpers found', view_helpers.length);

    var self = this;
    var gate = new Gate(cb);
    view_helpers.forEach(function(helper){
        helper.init(self, input, gate.task_done_callback(true));
    })

    gate.start();
}