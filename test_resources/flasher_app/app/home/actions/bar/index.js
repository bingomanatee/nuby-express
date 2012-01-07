

module.exports = {

    execute: function(req_state, callback){
        req_state.put_flash('bar', 'info');
        callback();
    }

}