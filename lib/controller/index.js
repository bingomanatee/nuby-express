var get_param = require('./../get_param');

function Controller(framework) {
    this.framework = framework;
    this.actions = {};
    this.params = {};
    this._default_params = {};
}

Controller.prototype = {


    get_param:function (req_state, what, callback, absent) {
        var self = this;

      //          console.log('looking in controller %s', this.path);
        function _absent() {
            self.framework.get_param(req_state, what, callback, absent);
        }

        get_param(this.params, req_state, what, callback, _absent);
    }
}

module.exports = Controller;