var _ = require('./../../node_modules/underscore');
var mongoose = require('./../../../../node_modules/mongoose');
var util = require('util');

/**
 * Mongoose Model is, for the most part, a wrapper for the mongoose schema.
 * There are a few reasons for its existence:
 *
 * 1) its generally considered good practice to have a layer between
 *    your custom model class and the retrieval class
 *
 * 2) I wanted a more REST-ish API for models, one that while it allows for
 *    mongoosey options, also allows for a more streamlined use of traditional
 *    rest methods a la MyModel.get(3, function(err, my_model)).
 *
 * That being said, the MongooseModel returns Mongoose Documents, not instances
 * of itself or any other custom record .. by default.
 *
 * @param model
 * @param config
 */

function MongooseModel(model, config) {

    if (config) {
        _.extend(this, config);
    }

    this.model = model;

}

MongooseModel.prototype = {

    force_oid:true,

    get:function (id, fields, options, callback) {
        return this.model.findById(id, fields, options, callback);
    },

    put:function (doc, options, callback) {
        if (typeof options == 'function') {
            callback = options;
            options = {};
        }

        var doc_obj = new this.model(doc);
        console.log('new document ID: %s', doc_obj._id);

        function _cb(err, put_record) {
            console.log('MongooseModel: put %s', util.inspect(put_record));
            console.log('MongooseModel: doc %s', util.inspect(doc_obj));
            console.log('saved document ID: %s', doc_obj._id);
            callback(err, doc_obj);
        }

        doc_obj.save(_cb);
    },

    find:function (crit, field, options, callback) {
        this.model.find(crit, field, options, callback);
    },

    find_one:function (crit, field, options, callback) {
        this.model.findOne(crit, field, options, callback);
    },

    all:function (callback) {
        function _on_find(err, data) {
            console.log('data returned: %s', util.inspect(data, null, 0));
            callback(err, data);
        }

        console.log('model: %s', util.inspect(this.model));
        this.model.find(_on_find);
    },

    model:null
}

module.exports = {
    MongooseModel:MongooseModel,
    create:function (model, config) {
        return new MongooseModel(model, config);
    }
}