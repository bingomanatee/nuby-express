var NE = require('nuby-express');
var proper_path = require('support/proper_path');

module.exports = {
    apply: function(server, frame, cb){
        server.use(NE.multi_static({frame: frame}));
        cb();
    }
}