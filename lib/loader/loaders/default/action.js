var _ = require('./../../../../node_modules/underscore');
var util = require('util');

function Action(config) {
    _.extend(this, config);
}

Action.prototype = {

    get_route: function(){
        if (this.route){
            return this.route;
        } else {
            return util.format('/%s/%s', this.controller.name, this.name);
        }
    },

    handle: function(req, res, next){
        var action = this;
        function _on_make_params_closure(err, params){
            action.render(params, req, res, next);
        }
        this.make_params(req, res, _on_make_params_closure);
    },

    method: 'get',

    make_params: function(req, res, callback){
        callback(null, {});
    },

    render: function(params, req, res, next){
        if (this.view_path){
            res.render(this.view_path, params);
        } else {
            res.send(params);
        }
    },

    view_path: ''

}

module.exports = Action;