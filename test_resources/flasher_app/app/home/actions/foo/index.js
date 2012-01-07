module.exports = {

    execute:function (req_state, callback) {
        req_state.put_flash('foo', 'info');
        req_state.put_flash('bar', 'error');
        callback();
    }

}