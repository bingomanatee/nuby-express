var mongoose = require('mongoose');

module.exports = {
    start_server:function (frame, cb) {
        var con = 'mongodb://localhost/' + frame.config.mongoose.db;

        mongoose.connect(con);

        cb();
    }
}