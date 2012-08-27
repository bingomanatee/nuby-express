var util = require('util');
var path = require('path');
var NE = require('./../lib');
var _ = require('underscore');
var error_emit = require('./../lib/Action/error_emit');
var events = require('events');
var Mock_Req_State = require("./../lib/Req_State/Mock")
var _DEBUG = false;

var MockAction = function (props) {
    events.EventEmitter.call(this);
    _.extend(this, props);
    this.listen_to_errors({mock:true});
    this.CLASS = 'MOCK_ACTION'
}

util.inherits(MockAction, events.EventEmitter);
_.extend(MockAction.prototype, error_emit);

module.exports = {
    setUp:function (cb) {
        this.stock_action = new MockAction({});
        cb()
    },

    tearDown:function (cb) {
        delete this.stock_action;
        cb()
    },

    test_stock_listener:function (test) {
        var URL = '/mock_url';

        this.stock_action.on('error_response', function (rs, msg, props) {
            if (_DEBUG)    console.log("\n\n\n ********** TEST TRAP ********** \n\n");
            if (_DEBUG)      console.log('error_response(<rs %s rs>, <msg %s msg>, <props %s props>)', util.inspect(rs, true, 1), util.inspect(msg), util.inspect(props));

            test.equals(msg, 'foo', 'message echoed');
            test.equals(rs.req_props.bar, 4, 'rs retained');
            test.equals(props.url, URL, 'URL passed to error message')
            test.done();
        })
        var rs = new Mock_Req_State(
            this.stock_action,
            {
                url:URL,
                req_props:{
                    bar:4
                }
            }
        );

        this.stock_action.emit('error', rs, 'foo', {bar:2}, {});

    },

    test_method_inference_from_req:function (test) {
        var URL = '/mock_url';

        this.stock_action.on('error_response', function (rs, msg, props) {
            if (_DEBUG ) console.log("\n\n\n ********** TEST TRAP ********** \n\n");
            if (_DEBUG ) console.log('error_response(<rs %s rs>, <msg %s msg>, <props %s props>)', util.inspect(rs, true, 1), util.inspect(msg), util.inspect(props));

            test.equals(props.method, 'post', 'post method retained')
            test.equals(msg, 'foo', 'message echoed');
            test.equals(rs.req_props.bar, 4, 'rs retained');
            test.equals(props.url, URL, 'URL passed to error message')
            test.done();
        })
        var rs = new Mock_Req_State(
            this.stock_action,
            {
                url:URL,
                req_props:{
                    bar:4
                },
                method: 'post'
            }
        );

        this.stock_action.emit('error', rs, 'foo', {bar:2}, {});

    },

    test_type_sugar:function (test) {
        var URL = '/mock_url';

        this.stock_action.on('error_response', function (rs, msg, props) {
            if (_DEBUG ) console.log("\n\n\n ********** TEST TRAP ********** \n\n");
            if (_DEBUG ) console.log('error_response(<rs %s rs>, <msg %s msg>, <props %s props>)', util.inspect(rs, true, 1), util.inspect(msg), util.inspect(props));

            test.equals(props.type, 'input', 'input type retained')
            test.equals(msg, 'foo', 'message echoed');
            test.equals(rs.req_props.bar, 4, 'rs retained');
            test.equals(props.url, URL, 'URL passed to error message')
            test.done();
        })
        var rs = new Mock_Req_State(
            this.stock_action,
            {
                url:URL,
                req_props:{
                    bar:4
                }
            }
        );

        this.stock_action.emit('input_error', rs, 'foo', {bar:2}, {});

    },

    test_type_sugar2:function (test) {
        var URL = '/mock_url';

        this.stock_action.on('error_response', function (rs, msg, props) {
            if (_DEBUG ) console.log("\n\n\n ********** TEST TRAP ********** \n\n");
            if (_DEBUG ) console.log('error_response(<rs %s rs>, <msg %s msg>, <props %s props>)', util.inspect(rs, true, 1), util.inspect(msg), util.inspect(props));

            test.equals(props.method, 'post', 'post method retained')
            test.equals(msg, 'foo', 'message echoed');
            test.equals(rs.req_props.bar, 4, 'rs retained');
            test.equals(props.url, URL, 'URL passed to error message')
            test.done();
        })
        var rs = new Mock_Req_State(
            this.stock_action,
            {
                url:URL,
                req_props:{
                    bar:4
                },
                method: 'post'
            }
        );

        this.stock_action.emit('post_error', rs, 'foo', {bar:2}, {});

    }

}