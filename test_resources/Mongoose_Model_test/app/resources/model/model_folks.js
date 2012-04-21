var Mongoose_Model = require("node-support/mongoose_model");
var NE = require('./../../../../../lib');
var util = require('util');
var _ = require('underscore');
var mongoose = require('mongoose');
function Mongoose_Model_Resource(model, config) {
    Mongoose_Model.MongooseModel.call(this, model, config);
}

util.inherits(Mongoose_Model_Resource, Mongoose_Model.MongooseModel);
_.extend(Mongoose_Model_Resource.prototype, NE.Resource.prototype);

var _model;
//console.log('SMR prototype: %s, model: %s', util.inspect(Simple_Model_Resource.prototype), util.inspect(Simple_Model_Resource));
module.exports = function () {
    if (!_model) {
        var schema = new mongoose.Schema({
            name:String,
            notes:String,
            birthday:Date,
            gender: Number // 1 = male, -1 = female, 0/other == ??
        });

        var model = mongoose.model('Folks', schema);

        _model = new Mongoose_Model_Resource(model, {});
    }
    return _model;
}