var Gate = require('support/gate');
var Timebomb = require('support/Timebomb');

module.exports = function (callback) {
    var self = this;
    if (this._server_started){
        throw new Error('attempt to start ne server twice');
    }
    this._server_started = true;
    this._server = require('express').createServer();
    console.log(' ------- start server ---------');
    this.import_child_resources();

    var self = this;
    var gate = new Gate(callback);

    var mixins = this.get_resources('mixin');
    mixins.forEach(function (mixin) {
        mixin.init(self, gate.task_done_callback(true));
    });

    var eh = this.get_resources('express_helper');

    eh.forEach(function (ehr) {
        ehr.start_server(self.server(), self, gate.task_done_callback(true));
    });

    self.components.forEach(function (com) {
        if (com && com.CLASS == 'COMPONENT') {
            com.start_server(self.server(), self, gate.task_done_callback(true));
        } else {
            console.log('bad compoennt: %s', util.inspect(com));
        }
    })

    self._controllers.forEach(function (con) {
        if (con && con.CLASS == 'CONTROLLER') {
            con.start_server(self.server(), self, gate.task_done_callback(true));
        } else {
            console.log('bad controller: %s', util.inspect(con));
        }
    });

    gate.start();


};