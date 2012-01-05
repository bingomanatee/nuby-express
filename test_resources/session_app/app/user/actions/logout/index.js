var util = require('util');

module.exports = {

    route:'/logout',

    execute:function (req_state, callback) {
        req_state.get_param('id', function (id) {
            req_state.clear_session();
         //   console.log('id set to %s, session: %s', id, util.inspect(req_state.req.session));
            req_state.res.redirect('/');
        }, 0);
    }


}