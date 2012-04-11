var events = require('events');
var util = require('util');
var _ = require('underscore');
var Loader = require('./../Loader');

function Framework(config) {
    if (false === (this instanceof Framework)) {
        return new Framework(config);
    }

    _.extend(this, config);
}

util.inherits(Framework, events.EventEmitter);
util.inherits(Framework, Loader);

_.extend(Framework.prototype, {

    ROOT_DIR: false,

})

module.exports = Framework;