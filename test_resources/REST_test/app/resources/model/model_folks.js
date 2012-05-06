var Mongoose_Model = require("support/mongoose_model");
var NE = require('./../../../../../lib');
var util = require('util');
var _ = require('underscore');
var mongoose = require('mongoose');

var _model;
//
module.exports = function () {
    if (!_model) {
        var schema = new mongoose.Schema({
            name:String,
            notes:String,
            birthday:Date,
            gender: Number // 1 = male, -1 = female, 0/other == ??
        });

        _model =  Mongoose_Model.create(schema, {type: 'model', name: 'folks'});
    }
    return _model;
}