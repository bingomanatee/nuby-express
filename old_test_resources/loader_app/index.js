var express = require('./../.');

var app = express.createServer();
app.set('view_engne', 'ejs');

module.exports = {

    app: app

}