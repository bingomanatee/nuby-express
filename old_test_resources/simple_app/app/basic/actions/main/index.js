/**
 * This is action main of controller home
 */

module.exports = {

    route: '/',

    execute: function(req_state, callback){

        callback(null, '<html><body>Welcome to Test Site</body></html>');

    }
};