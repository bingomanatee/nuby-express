var mongoose = require('mongoose');

module.exports = {
    init:function (frame, cb) {
        var con = 'mongodb://localhost/' + frame.config.mongoose.db;

        mongoose.connect(con);

        cb();
    }
}