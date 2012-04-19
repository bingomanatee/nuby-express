var util = require('util');
var Req_State = require('./../../Req_State');

var Base_Template = require('./Simple');

var Static_Template = function(){
};

util.inherits(Static_Template, Base_Template);

_.extend(Static_Template.prototype, {
    _content: false,

    /**
     * This action MUST be overridden for this method to be meaningful.
     * @param rs
     */
    on_execute: function(rs){
        if (!this._content){
            this._content = this.page_template(rs)({});
        }
        rs.send(this._content);
    }

})