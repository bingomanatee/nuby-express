var NE = require('nuby-express');
var _ = require('underscore');
var util = require('util');


var each_msg = '<% md.messages.forEach(function(msg){ %>' +
    '<li><%= msg %></li>' +
    '<% }) %>';
var foreach = '<% messages.forEach(function(md) { %>' +
    '<h3><%= md.type %></h3>' +
    '<ul>' + each_msg + '</ul>' +
    '</div><% }) %>';
var content = '<% if (count > 0) { %>' +
    '<div class="flash_messages"><h2>Messages:</h2>' +
    foreach +
    '<% } else { %><!-- no messages --><% } %>';
var _template = _.template(content);

var _msg_types =['info', 'error', 'warning'];

function _flash_messages(rs) {
    var messages = [];

    var self = this;
    _msg_types.forEach(function (type) {
        var m_list = rs.flash(type);
       // console.log('messages for %s = %s', type, util.inspect(m_list));
        if (m_list && m_list.length) {
            messages.push({type:type, messages:m_list});
        }
    });

    return messages;
}

function _render(rs) {
    var message_sets = _flash_messages(rs);

    var count = _.reduce(message_sets, function(c, s){
        return c + s.messages.length;
    }, 0);

    return _template({messages: message_sets, count: count});
}

module.exports = {
    name: 'flash',
    init: function(rs, input, cb){
        if (!input.hasOwnProperty('helpers')){
            input.helpers = {};
        }
        input.helpers.flash = function(){
            return _render(rs);
        }
        cb(null, this.name);
    }

};