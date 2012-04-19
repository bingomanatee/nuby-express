var util = require('util');
var Req_State = require('./../../Req_State');
var _ = require('underscore');
var Base_Template = require('./Base');

var Simple_Template = function(){
};

util.inherits(Simple_Template, Base_Template);

_.extend(Simple_Template.prototype, {

    after_load: function(){
        this.type = 'simple';
    },

    /**
     * The quality of a simple action is that it skips routing validation, input, and output and handles everything in the on_execute method.
     * @param req
     * @param res
     */
    respond:function (req, res) {
        var rs = new Req_State(req, res, this, this.controller, this.framework);
        this.on_execute(rs);
    },

    /**
     * This action MUST be overridden for this method to be meaningful.
     * @param rs
     */
    on_execute: function(rs){
        rs.send({});
    }

})