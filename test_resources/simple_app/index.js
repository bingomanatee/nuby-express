var express = require('./../../node_modules/express');
var ejs = require('./../../node_modules/ejs');

var app = express.createServer();
app.set('view_engne', 'ejs');
app.register('.html', ejs);
app.set('view options', {layout: false});

module.exports = {

    app: app

}