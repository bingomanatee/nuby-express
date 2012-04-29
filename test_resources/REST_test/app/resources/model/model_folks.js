var Mongoose_Model = require("support/mongoose_model");
var NE = require('./../../../../../lib');
var util = require('util');
var _ = require('underscore');
var mongoose = require('mongoose');

var _model;
//
module.exports = function () {
    if (!_model) {
        var schema ={
            name:String,
            notes:String,
            birthday:Date,
            gender: Number
        };

        _model =  Mongoose_Model.create(schema, {name: 'Folks'});
        _model.type = 'type';
        _model.name = 'folks';
    }
    return _model;
};