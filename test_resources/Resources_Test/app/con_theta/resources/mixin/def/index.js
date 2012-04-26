var Resource = require('./../../../../../../../lib/Resource');

var util = require('util');
var _ = require('underscore');

function Reactor(){
}

util.inherits(Reactor, Resource);

_.extend(Reactor.prototype, {
    _name: 'resource_react',
    type: 'mixin',
    apply: function(target, cb){
     //
        target.def = 'def'.split('');
        cb();
    }
});

module.exports = function(){
    return new Reactor();
}