var Gate = require('support/gate');

module.exports = function (callback) {
    this._server = require('express').createServer();
    this._server_work = 0;
    this._server_started = false;

    var self = this;
    var gate = new Gate(callback);

    this.import_child_resources();

    var mixins = this.get_resources('mixin');
    mixins.forEach(function (ehr) {
        ehr.apply(self, gate.task_done_callback(true));
    });

    var eh = this.get_resources('express_helper');
    eh.forEach(function (ehr) {
        ehr.apply(self._server, self, gate.task_done_callback(true));
    });

    this.components.concat(this.controllers).forEach(function (c) {
        c.start_server(self._server, self, gate.task_done_callback(true));
    });

    gate.start();
};