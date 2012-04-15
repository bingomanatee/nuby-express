var util = require('util');
var _ = require('underscore');
var Component = require('./../Component');
var coms_handler = require('./handler/Components');
var com_handler = require('./handler/Component');
var config_handler = require('./handler/Config');
var controller_handler = require('./../Component/handler/Controller');
var controller_dir_loader = require('./../Component/handler/Controller_dir');
var path = require('path');

var _DEBUG = false;
/**
 * The Framework is a singleton that coordinates the entire application.
 * As an EventEmitter, it can handle asynchronous messaging for a variety of
 * (future) functionality.
 *
 * Its primary role is to serve as an Express server - however, its design is
 * open enough to serve other purposes.
 *
 * A Frameworks primary purpose is to allow the loading and exeuction of one or more Components,
 * as well as directly containing core controllers, models and views.
 *
 * Note that Framework extends Component so any resources that can be stored in a Component
 * can be stored in a framework.
 *
 * A straighforward MVC app might have all its contents in an 'app' directory
 * Inside an App can be both controllers and components (see).
 *
 * @param config
 */

function Framework(config) {
    this.components = [];
    Component.call(this, config);
}

//util.inherits(Framework, Component);

_.extend(Framework.prototype, Component.prototype, {

    CLASS:'FRAMEWORK',

    _init_handlers:function () {
        this.add_handler(controller_handler);
        this.add_handler(controller_dir_loader);
        this.add_handler(coms_handler);
        this.add_handler(com_handler);
        this.add_handler(config_handler);
    },

    load_component:function (com_path, cb) {
      if (_DEBUG)  console.log('FRAMEWORK loading component %s', com_path);
        var com = new Component({path:com_path, parent: this});
        this.components.push(com);
        com.start_load(cb, com_path);
    },

    /* ****************** NAMES ********************* */

    controller_names:function (include_components) {
        var cn = _.map(this.controllers, function(c){ return c.name()});

      if (_DEBUG)  console.log('root controller names of %s: [%s]', this.name(), cn.join(','));
        if (include_components) {
            return cn.concat(this.com_controller_names());
        }

        return cn;
    },

    com_controller_names:function () {
       return _.flatten(_.map( this.components, function (com) {
            return com.controller_names();
        }));
    },

    name:function () {
        return path.basename(this.path).replace(/^frame(work)?_/i, '');
    },

    controller_heritage: function(include_com){
        var ch = _.map(this.controllers, function(c){
            return c.heritage();
        });

        if (include_com){
            return ch.concat(this.com_controller_heritage());
        }

        return ch;
    },

    com_controller_heritage: function(){
        return _.flatten(_.map(this.components, function(com){
            return com.controller_heritage();
        }));
    }
});

module.exports = Framework;
