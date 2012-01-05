function Controller(framework) {
    this.framework = framework;
    this.actions = {};
    this.params = {};
    this._default_params = {};
}

Controller.prototype = {


        get_param:function (req_state, what, callback, absent) {
            if (this.params.hasOwnProperty(what)) {
                if (typeof this.params[what] == 'function') {
                    this.params[what](req_state, callback, absent);
                } else {
                    callback(this.params[what]);
                }
            } else {
                this.framework.get_param(req_state, what, callback, absent);
            }
        },
}

module.exports = Controller;