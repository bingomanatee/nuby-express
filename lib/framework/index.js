var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Component = require('./../Component');
var path = require('path');

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
    Component.call(this, config);
    this.components = [];
    this._init_framework_handlers();
}

util.inherits(Framework, Component);

_.extend(Framework, {
    _init_framework_handlers: function(){
        //@TODO: load sub components
    }
});

module.exports = Framework;
