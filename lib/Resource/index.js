var digest_config = require('./../utility/digest_config');
var heritage = require('./../utility/heritage');

var _ = require('underscore');
var util = require('util');
var events = require('events');

/**
 * Resource is ulitmately an interface: it must have a name and a type, and that combination must
 * be unique across the applciation. The name and type of a resouce deafaults to the values
 * set by convention. ie., resource/model/model_foo.js will by default be a model named foo.
 *
 * Resources must be defined as either parameterless factory functions or naked objects.
 *
 * In the latter case, resources are created by extending a new Resource with said object.
 *
 * In the former case they can be - or be created by - any number of methods and may or may not be singletons.
 * They also are not absolutely required to extend from the Resource class, as long as they implement
 * name and type properties, and (if they are mixins or express_helpers) the apply method.
 *
 * In the case of factories, any configuration or individuation of a particular resource
 * must be done underneath the closure.
 *
 * A resource may optionally have an on_add(frame, callback) method that responds to being
 * added to its parent. There is no guarantee regarding the ordering of resource loading at this point so
 * on_add should not depend in any way on resource load ordering. it could, for instance,
 * add an event listener for "load_done" on the frame framework to execute an action after all
 * resources have loaded.
 *
 * Two other specialist resources are express_helpers and mixins.
 *
 * mixins have an apply method, apply(framework, callback) that is called after all resources have been loaded
 * but before the express_helpers have been apply()'d.
 *
 * express_helpers are specifically designed to alter or configure the express server
 * and must have an apply(server, framework, callback) method designed to facilitate this activity.
 * Again there is no guarantee as to which order this alteration will occur in, and its best to
 * put them all in app/resources to avoid overlapping component or controller alteration of the server.
 *
 */

function Res(config) {
   if (config){
       _.extend(this, config);
   }
}

util.inherits(Res, events.EventEmitter);

_.extend(Res.prototype, {
    digest_config:digest_config,
    heritage:heritage,

    type:'general',
    name: false
})

module.exports = Res;