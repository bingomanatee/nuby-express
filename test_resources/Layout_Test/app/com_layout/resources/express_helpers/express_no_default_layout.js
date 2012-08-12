var NE = require('nuby-express');

module.exports = {
    start_server:function (server, frame, cb) {
        server.set('view options', {layout:false});
        cb();
    }
}