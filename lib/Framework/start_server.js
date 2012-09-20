var Gate = require('support/gate');
var Timebomb = require('support/Timebomb');
var util = require('util');
var path = require('path');
var _DEBUG = false;
module.exports = function (callback) {
    var self = this;
    if (this._server_started){
        throw new Error('attempt to start ne server twice');
    }
    this._server_started = true;
    this._server = require('express').createServer();
   if (_DEBUG) console.log(' ------- start server ---------');
    this.import_child_resources();

    var self = this;
    var gate = new Gate(callback, 'server_start '  + this.id());
    gate.name = 'framework: start server',

    gate.debug = false;

    var mixins = this.get_resources('mixin');
    if (_DEBUG) console.log('mixins: %s', util.inspect(mixins));

    mixins.forEach(function (mixin) {
        gate.task_start();
        mixin.init(self, gate.task_done_callback(false, function(){
            'done with mixin ' + mixin.name;
        }));
    });

    var eh = this.get_resources('express_helper');

    eh.forEach(function (ehr) {
        gate.task_start();
        if (!ehr.start_server){
            throw new Error("Cannot find express handler's start server: " + util.inspect(ehr));
        }
        ehr.start_server(self.server(), self, gate.task_done_callback());
    });

    self.components.forEach(function (com) {
        if (com && com.CLASS == 'COMPONENT') {
            gate.task_start();
            if (!com.start_server){
                throw new Error("Cannot component's start server: " + util.inspect(com));
            }
            com.start_server(self.server(), self, gate.task_done_callback());
        } else {
            console.log('bad compoennt: %s', util.inspect(com));
        }
    })

    self._controllers.forEach(function (con) {
        if (con && con.CLASS == 'CONTROLLER') {

            gate.task_start();
            if (!con.start_server){
                throw new Error("Cannot find express handler's start server: " + util.inspect(con));
            }
            con.start_server(self.server(), self, gate.task_done_callback());
        } else {
            console.log('bad controller: %s', util.inspect(con));
        }
    });
/*
    process.nextTick(function(){
        gate.start();
    }) */

    gate.start();


};