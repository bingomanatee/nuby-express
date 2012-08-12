var Simple_Model = require("support/simple_model");
var NE = require('./../../../../../lib');
var util = require('util');
var _ = require('underscore');

function Simple_Model_Resource(config, data){
    Simple_Model.call(this, config, data);
}

util.inherits(Simple_Model_Resource, Simple_Model);
_.extend(Simple_Model_Resource.prototype, NE.Resource.prototype);
//
module.exports = function (data) {

    if (!data) {
        data = [
            {id:1, name:"foo"},
            {id:2, name:"bar"},
            {id:3, name:"quux"}
        ]
    }

    return new Simple_Model_Resource({}, data);

}