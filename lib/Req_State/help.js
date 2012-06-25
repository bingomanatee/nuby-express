var _ = require('underscore');
var Gate = require('support/gate');
var _DEBUG = false;
module.exports = function (input, cb) {
    var view_helpers = this.framework.get_resources('view_helper');
    if (!view_helpers.length) {
        return cb();
    }
    //  console.log('resources: %s', util.inspect(this.framework, true, 0));
    view_helpers = _.sortBy(view_helpers, function (h) {
        return h.weight ? h.weight : 0;
    });
    //   console.log('%s view helpers found', view_helpers.length);

    var self = this;
    var gate = new Gate(cb, 'req_state help');
    gate.debug = _DEBUG;
    view_helpers.forEach(function (helper) {
        gate.task_start(helper.name);
        if (self.timer) {
            self.add_time('starting view helper ' + helper.name);
        }
        helper.init(self, input, function () {
            if (self.timer) {
                self.add_time('Done with view helper ' + helper.name);
            }
            gate.task_done(helper.name);
        });
    })

    gate.start();
}