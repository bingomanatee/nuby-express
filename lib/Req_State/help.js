var _ = require('underscore');
var async = require('async');

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
    var queue = async.queue(function (helper, callback) {
     //   console.log('initializing helper %s', helper.name);
        helper.init(self, input, callback);
    }, 10);

    queue.drain = cb;

    queue.push(view_helpers, function (err, h) {
     //   console.log('finished //initializing helper %s', h ? h: '');
        // callback for init
    });
}