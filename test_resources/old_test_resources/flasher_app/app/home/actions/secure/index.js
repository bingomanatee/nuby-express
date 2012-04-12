

module.exports = {
    auth:function (req_state) {
        if (req_state.get_session('userid', 0) > 0){
                this.if_auth(req_state);
        } else {
            req_state.put_flash('login required', 'error', 'home');
        }
    }

}