var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* ***************** CLOSURE ************* */

/* ***************** MODULE *********** */

module.exports = {

    /* ****************** RESOURCES ************** */

    add_resource:function (res) {
        if (!this._resources) {
            this._resources = [];
        }
        this._resources.push(res);
    },

    add_resources: function(res){
        try {
            this._resources = this._resources.concat(res);

        } catch(err) {
            console.log(err);
        }
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
        var a = this.get_resources(type, name);
        if (a.length > 1) {
            throw new Error(util.format("ambiguous get_resource query: %s, %s", type, name));
        } else if (a.length <= 0) {
            throw new Error(util.format("cannot find get_resource query: %s, %s", type, name));
        }
        else {
            return a[0];
        }
    }

}