var Resource = require('./../../../../../../../lib/Resource');
var util = require('util');
var _ = require('underscore');

function RA1(){

}

util.inherits(RA1, Resource);

_.extend(RA1.prototype, {
    _name: 'resource_alpha_1',
    type: 'action_helper'
});

module.exports = function(){
    return new RA1();
}