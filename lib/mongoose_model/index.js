var _ = require('./../../node_modules/underscore');
var mongoose = require('./../../../../node_modules/mongoose');

function MongooseModel(model, config) {

    if (config) {
        _.extend(this, config);
    }

    this.model = model;

}

MongooseModel.prototype = {

    force_oid:true,

    get:function (id, fields, options, callback) {
        this.model.findById(id, fields, options, callback);
    },

    put:function (doc, options, callback) {
        if (typeof options == 'function') {
            callback = options;
            options = {};
        };

        var doc_obj = new this.model(doc, options);

        doc_obj.save(callback);
    },

    all: function(crit, callback){
        this.model.find(crit, callback);
    },

    model:null
}

module.exports = {
    MongooseModel:MongooseModel,
    create:function (model, config) {
        return new MongooseModel(model, config);
    }
}