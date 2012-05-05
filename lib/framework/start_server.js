var Gate = require('support/gate');
var async = require('async');

module.exports = function (callback) {
    this._server = require('express').createServer();

    this.import_child_resources();

    var self = this;
    var gate = new Gate(callback);

    var mixins = this.get_resources('mixin');
    mixins.forEach(function (mixin) {
        mixin.init(self, gate.task_done_callback(true));
    });

    var eh = this.get_resources('express_helper');

    eh.forEach(function (ehr) {
        ehr.start_server(self.server(), self, callback);
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