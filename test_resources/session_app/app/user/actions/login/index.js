var util = require('util');

module.exports = {

    method:'post',

    route:'/login',

    load_req_params: true,

    execute:function (req_state, callback) {
      //  console.log('req_state login request: %s', util.inspect(req_state.req));
      //  console.log('req id: %s', req_state.req.param('id'));
      //  console.log('req body: %s', util.inspect(req_state.req.body));
      //  console.log('login req: %s',util.inspect(req_state.req, null, 1));
        req_state.get_param('id', function (err, id) {
            req_state.set_session('user_id', id);
         //   console.log('id set to %s, session: %s', id, util.inspect(req_state.req.session));
            req_state.res.redirect('/');
        }, 0);
    }


}