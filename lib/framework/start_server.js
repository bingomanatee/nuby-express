var Gate = require('support/gate');

module.exports = function (callback) {
    this._server = require('express').createServer();
    this._server_work = 0;
    this._server_started = false;

    var self = this;
    var gate = new Gate(callback);

    _import_child_resources(this);

    var mixins = this.get_resources('mixin');
    mixins.forEach(function (mixin) {
        mixin.init(self, gate.task_done_callback(true));
    });

    var eh = this.get_resources('express_helper');
    eh.forEach(function (ehr) {
        ehr.init(self._server, self, gate.task_done_callback(true));
    });

    this.components.forEach(function (c) {
        c.start_server(self._server, self, gate.task_done_callback(true));
    });

    this.controllers.forEach(function (c) {
        c.start_server(self._server, self, gate.task_done_callback(true));
    });

    gate.start();
};


function _import_child_resources(self) {
    self.controllers.forEach(function (con) {
        self._resources = self._resources.concat(con.get_resources());
    });
    self.components.forEach(function (con) {
        con.import_child_resources();
        self._resources = self._resources.concat(con.get_resources());
    });
}
