

module.exports = {

    session:function (key, def) {
        if (this.req.hasOwnProperty('session')) {
            if (this.req.session.hasOwnProperty(key)) {
                return this.req.session[key];
            } else {
                return def;
            }
        } else {
            return def;
        }
    },

    set_session:function (key, value) {
        this.req.session[key] = value;
    },

    clear_session:function (key) {
        this.req.session[key] = null;
    }

}