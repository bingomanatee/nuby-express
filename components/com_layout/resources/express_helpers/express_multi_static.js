var NE = require('nuby-express');

module.exports = {
    start_server: function(server, frame, cb){
        server.use(NE.Multi_Static({frame: frame}));
        cb();
    }
}