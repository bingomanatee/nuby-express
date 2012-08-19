var _ = require('underscore');
var util = require('util');
var async = require('async');
var fs = require('fs');
var _session = require('./session');
var _validation = require('./validation');

function Req_State_Mock(action, props) {
    this.action = action;
    this.req_props = props.req_props ? props.req_props : {};
    this.req = {
        session: props.session ? props.session : {}
    };
    this._config = props.config ? props.config : {};
    this.flash_msgs = [];
    this.go_places = [];
}

_.extend(Req_State_Mock.prototype , _session);
_.extend(Req_State_Mock.prototype, _validation);

_.extend(Req_State_Mock.prototype , {
    get_config: function(key){
        return this._config[key];
    },
    flash: function(type, msg){
        this.flash_msgs.push({type: type, msg: msg})
    },
    go: function(dest){
        this.go_places.push(dest);
    }
})

module.exports = Req_State_Mock;