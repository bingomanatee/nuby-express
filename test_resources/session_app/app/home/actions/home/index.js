var util = require('util');

module.exports = {

    route: '/',

    execute: function(req_state, callback){

      //  console.log('session store: %s', util.inspect(req_state.req.sessionStore.sessions));
        callback(null, {id: req_state.get_session('user_id', 0)});
    }

}