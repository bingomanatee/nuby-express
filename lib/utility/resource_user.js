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
            throw new Error(util.format("ambiguous get_resource query: %s, %s - ", type, name, util.inspect(a)));
        } else if (a.length <= 0) {

            this.report_resources();

            throw new Error(util.format("cannot find get_resource query: type = %s,  name = %s", type, name));
        }
        else {
            return a[0];
        }
    },

    report_resources: function(){
        console.log('resources for %s(%s)', this.name, this.CLASS);
        var mr_resources = _.reduce(this._resources, function(map, res){
            if (!map[res.type]){
                map[res.type] = [];
            }

            map[res.type].push(res);

            return map;
        }, {});


        _.each(mr_resources, function(res, type){
            console.log('========= %s ============', type);
            _.each(res, function(r){
                console.log('resource %s, path %s', r.name, r.root ? r.root : r._resource_path);
            })
        })
    }

}