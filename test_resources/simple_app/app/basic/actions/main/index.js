/**
 * This is action main of controller home
 */

module.exports = {

    route: '/',

    make_params: function(req, res, callback){

        callback(null, '<html><body>Welcome to Test Site</body></html>');

    }
};