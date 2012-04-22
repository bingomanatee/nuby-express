var ejs = require('ejs');


module.exports = {
    apply: function(server, target, cb){
       // console.log('applying loggeg');
        server.set('view_engine', 'ejs');
        server.set('view options', {
          layout: false
        });
        server.engine('.html', require('ejs').__express);
        cb();
    }
}