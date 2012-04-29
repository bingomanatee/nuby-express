var _ = require('underscore');
var util = require('util');
var fs = require('fs');

/* *************** MODULE ********* */

module.exports = {
    /* ***************** HANDLERS ***************** */

    _handlers:false,

    /**
     * Note - because handlers are registered with their owners (registrees?),
     * handlers must be output from factory functions, not shared between resources.
     * @param handler
     */
    add_handler:function (handler) {
        handler.owner = this;
        if (!this._handlers) {
            this._handlers = [];
        }
        this._handlers.push(handler);
    },

    filter_handlers:function (filter) {
        this._handlers = _.filter(this._handlers, filter);
    },

    handlers:function (type) {
        var handlers = [];
        if (this._handlers) {

            if (type) {
                this._handlers.forEach(function (handler) {
                    if (handler.type == type) {
                        //@TODO: handle complex filter types
                        handlers.push(handler);
                    }
                });
            } else {
                handlers = this._handlers.slice(0);
            }
        }

        return handlers;
    }
}