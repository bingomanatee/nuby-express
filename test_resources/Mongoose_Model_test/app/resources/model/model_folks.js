var Mongoose_Model = require("support/mongoose_model");
var NE = require('./../../../../../lib');
var util = require('util');
var _ = require('underscore');
var mongoose = require('mongoose');

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

        _model =  Mongoose_Model.create(model, {});
        _model.type = 'type';
        _model.name = 'folks';
    }
    return _model;
}