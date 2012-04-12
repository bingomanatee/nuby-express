

module.exports = {

    method:'post',

    route:'/register_post',

    load_req_params: true,

    execute: function(req_state, callback){
        var self = this;
        req_state.get_params(['username', 'password'], function(err, values){

            if (values.username && values.password){
                self.new_user(values); // ignoring dupes for now
            } else {
                request.redirect('/signup')
            }

        });
    }

}