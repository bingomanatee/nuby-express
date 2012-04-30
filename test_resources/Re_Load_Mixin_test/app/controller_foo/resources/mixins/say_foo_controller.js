var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = {
    name: 'say_foo_controller',
    init: function(frame, cb){
        frame.config.controllers_loaded.push('foo');
        cb();
    }
}