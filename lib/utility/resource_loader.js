var util = require('util');
var _ = require('underscore');

module.exports = {
    /* ****************** RESOURCES ************** */

    add_resource:function (res) {
        if ((!res.name) || (!res.type)){
            throw new Error('attempt to add resource without type or name: %s', util.inspect(res));
        }
        if (!this._resources) {
            this._resources = [];
        }
        this._resources.push(res);
    },

    get_resources:function (type, name) {
        if (!this._resources) {
            return [];
        }
        if ((!type) && (!name)) {
            return this._resources.slice(0);
        }

        return _.filter(this._resources, function (r) {
            if (type && r.type !== type) {
                return false;
            }
            if (name && r.name != name) {
                return false;
            }
            return true;
        });
    },

    get_resource:function (type, name) {
        if (!this._resources) {
            return null;
        }
        var a = this.get_resources(type, name);
        if (a.length > 1) {
            throw new Error(util.format("ambiguous get_resource query: %s, %s", type, name));
        } else if (a.length == 1) {
            return a[0];
        } else {
            return null;
        }
    }

}