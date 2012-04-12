var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var Loader = require('./../Loader');
var Path_Handler = require('./../Loader/Path_Handler');
var Controller = require('./../Controller');
var path = require('path');

/**
 * A "Component" is essentially a base balss for the abstract Loader class, designed for the
 * MVC environment. Note that the Framework is itself a component; that is, a simple
 * web application can consist of a single Component, that being the Framework.
 *
 * Components expand on the Express concept of Middleware, except where Middleware
 * is a narrow pipe within request/response handling, Components can include
 * a suite of middleware, static and utility resources and can share each others resources,
 * esp. in the case of models.
 *
 * @param config
 */

function Component(config) {
    Loader.call(this, config);
    this._init_component_handlers();
}

util.inherits(Component, Loader);

_.extend(Component.prototype, {
    can_load:function (load_path, type) {
        switch (type) {
            case 'file':
                return true;
                break;

            case 'dir':
                return true;
                break;

            default:
                return path.existsSync(load_path);
        }
    },

    _init_component_handlers: function(){
        var config_handler = new Path_Handler({
            type: 'file',
            re: /config.json/i,
            target: this,

            execute: function(match_path, callback, match){
                fs.readFile(match_path, 'utf8', function(err, content){
                    if (err){
                        return callback(err);
                    }
                    try {
                        var config = JSON.parse(content);

                        this.target.config = config;
                    } catch (e){
                        console.log('error parsing config file %s: %s', match_path, util.inspect(err));
                        this.target.config = config;
                    }
                    callback(null, true);
                });
            }
        });
        this.add_handler(config_handler);

        var controller_handler = new Path_Handler({
            re: /con(troller)?_(.*)/,
            type: 'dir',
            execute: function(match_path, callback, match){
                var name = match ? match[match.length - 1] : '';
                console.log('"creating" controller %s (%s)', match_path, name);
                callback(null, true);
            }
        });

        this.add_handler(controller_handler);
    },

    _load_dir_policy:'load',

    done_delay:1500 // milliseconds until done is emitted;

});

module.exports = Component;
