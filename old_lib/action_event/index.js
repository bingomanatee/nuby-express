var _ = require('../../node_modules/underscore');

function Event_Handler(req_state, event_name, on_done) {
    this.level = 'action';
    this.event_name = event_name;
    this.on_done = on_done;
    this.req_state = req_state;
}

Event_Handler.prototype = {
    level:'action',
    event_name:null,
    on_done:null,
    req_state:null,
    handlers:null,

    handle:function () {
        var base = this.req_state[this.level];
        if (base.hasOwnProperty(event_name)) {
            var handler_list = 'on_' + this.event_name;
            var base_handler = base[handler_list];
            if (!base_handler) {
                return event.next_level();
            }
            if (_.isFunction(base_handler)) {
                base_handler = [base_handler];
            }
            this.handlers = base_handler;
            this.next_handler();
        }
    },

    next_handler:function () {
        if (this.handlers.length) {
            var f = this.handlers.shift();
            var event_handler = this;
            f(this.req_state, function () {
                event_handler.next_handler();
            });
        } else {
            this.next_level();
        }
    },

    next_level:function () {
        switch (this.level) {
            case 'action':
                this.level = 'controller';
                this.handle();
                break;

            case 'controller':
                this.level = 'framework';
                this.handle();
                break;

            default:
                this.on_done();
        }
    }

}

module.exports = {
    Event_Handler:Event_Handler,
    add_handler:function (target, event_name, handler) {
        var handler_list = 'on_' + event_name;
        if (target.hasOwnProperty(handler_list)){
            target[handler_list].push(handler);
        } else {
            target[handler_list] = [handler];
        }
    },

    handle:function (req_state, event_name, on_done) {
        var handler = new Event_Handler(req_state, event_name, on_done);
        handler.handle();
    }
}