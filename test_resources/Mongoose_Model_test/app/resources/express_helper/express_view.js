var ejs = require('ejs');


module.exports = {
    start_server: function(server, frame, cb){
        server.register('html', ejs);
        var view_dir = frame.path + '/views';

        server.set('views', view_dir);
         server.set('view options', { layout: false });
        cb();
    }
}