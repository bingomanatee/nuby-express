var _ = require('underscore');

function Req_State (req, res, action, controller, framework){
    this.req = req;
    this.res = res;
    this.controller = controller;
    this.framework = framework;
}

_.extend(Req_State.prototype, {

    respond: function(){
        console.log('RESPONDING');
    },

    /* ********************** MISC. PASSTHROUGHS ******************* */

    send: function(){
        var a = arguments;
        var args = [].slice.call(a, 0);
        this.res.send.apply(this.res, args);
    },

    method: function() {
        return this.req.route.method;
    }
});

module.exports = Req_State;
