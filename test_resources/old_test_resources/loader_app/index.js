var express = require('./../../node_modules/express');

var app = express.createServer();
app.set('view_engne', 'ejs');

module.exports = {

    app: app

}