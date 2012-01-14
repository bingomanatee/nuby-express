module.exports = {
    params:{
    foo:1
    },

    route: '/basic/pt1/:foo?',

    load_req_params: true,

    execute:function (req_state, callback) {
        req_state.get_param('foo', function(err, foo){
            callback(null, {foo: foo})
        }, 2);

    }
}