/**
 * This is action main of controller home
 */

module.exports = {

    route: '/bar',

    make_params: function(req, res, callback){

        callback(null, '<html><body>Welcome to Test Site</body></html>');

    }
};