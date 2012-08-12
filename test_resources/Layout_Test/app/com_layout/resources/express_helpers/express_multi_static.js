var NE = require('nuby-express');

module.exports = {
    start_server: function(server, frame, cb){
        var oneYear = 31557600000;
        server.use(NE.Multi_Static({frame: frame, maxAge: oneYear}));
        cb();
    }
}