var _ = require('underscore');
var util = require('util');
var async = require('async');
var fs = require('fs');
var _session = require('./session');
var _validation = require('./validation');
var _DEBUG = false;

function Req_State_Mock(action, props) {
    var NE = require('./../index');

    if (_DEBUG) console.log('mock req state props: %s', util.inspect(props));

    this.action = action;
    this.req_props = props.req_props ? props.req_props : {};
    this._method = props.method ? props.method : 'get'
    this.req = {
        session: props.session ? props.session : {},
        url: props.url ? props.url: '/'
    };
    this._config = props.config ? props.config : {};
    this.framework = props.framework? props.framework: new NE.Framework();
    this.flash_msgs = [];
    this.go_places = [];
    this.CLASS = 'Req_State_Mock'
}

_.extend(Req_State_Mock.prototype , _session);
_.extend(Req_State_Mock.prototype, _validation);

_.extend(Req_State_Mock.prototype , {
    'CLASS': 'Req_State_Mock',

    get_config: function(key){
        return this._config[key];
    },
    flash: function(type, msg){
        this.flash_msgs.push({type: type, msg: msg})
    },
    go: function(dest){
        this.go_places.push(dest);
    },
    method: function(){
        return this._method;
    },
    send: function(props){
        console.log('========= MOCK SENDING =========')
        console.log(util.inspect(props))
        console.log('================================')
    }
})

module.exports = Req_State_Mock;