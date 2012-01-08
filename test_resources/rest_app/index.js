var express = require('../../node_modules/express');
var ejs = require('../../node_modules/ejs');
var app = express.createServer();
app.use(express.bodyParser());
app.set('view_engne', 'ejs');
app.register('.html', ejs);
app.set('view options', {layout: false});


module.exports = {

    app: app,

        on_404: function(req, res){

            res.send('Not Found', 404);

        }

}