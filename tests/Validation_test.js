var _ = require('underscore');
var util = require('util');
var fs = require('fs');
var path = require('path');
var NE = require('./../lib');

/* ***************** CLOSURE ************* */

function mock_rs(config) {
    this.req_props = {};
    if (config) {
        _.extend(this, config);
    }
}

_.extend(mock_rs.prototype, {

    _method:'get',

    method:function () {
        return this._method;
    }
})

/* ***************** MODULE *********** */

module.exports = {

    test_basic_flow:function (test) {
        var rs = new mock_rs();

        var input_reached = false;
        var process_reached = false;
        var output_reached = false;

        var action = new NE.Action({

            name:'test_basic_flow',

            on_input:function (rs) {
                input_reached = true;
                // short circuit
            },

            on_process:function (rs, input) {
                process_reached = true;
                // short circuit
            },

            on_output:function (rs, input) {
                output_reached = true;
                // output short circuit
            }

        });

        action.validate(rs);

        test.ok(input_reached, 'input was reached');
        test.ok(!process_reached, 'process was not reached');
        test.ok(!output_reached, 'output was not reached');
        test.done();
    },

    test_basic_flow2:function (test) {
        var process_reached = false;
        var process_input = '';
        var output_reached = false;
        var output_input = false;
        var _pi_expect = 'foo';
        var rs = new mock_rs({req_props:_pi_expect});

        var action = new NE.Action({

            name:'test_basic_flow2',

            on_process:function (rs, input) {
                process_input = input;
                process_reached = true;
                // short circuit
            },

            on_output:function (rs, input) {
                output_reached = true;
                output_input = input;
                // output short circuit
            }

        });

        action.validate(rs);
        //   console.log(' --- TEST BASIC FLOW2 --- process_input: %s,  output_input: %s',
        //      process_input, output_input);

        test.ok(process_reached, 'process was reached');
        test.ok(!output_reached, 'output was not reached');
        test.equal(process_input, _pi_expect, 'process input passed along');
        test.done();
    },

    test_basic_flow3:function (test) {

        var output_reached = false;
        var output_input = '';
        var _pi_expect = 'foo';
        var _oi_expect = _pi_expect;
        var rs = new mock_rs({req_props:_pi_expect});

        var action = new NE.Action({

            name:'test3',

            on_output:function (rs, input) {
                output_reached = true;
                output_input = input;
                // output short circuit
            }

        });

        action.validate(rs);
        //  console.log(' --- TEST BASIC FLOW3 --- output_input: %s', output_input);

        test.ok(output_reached, 'output was reached');
        test.equals(output_input, _oi_expect, 'process output passed along');
        test.done();
    },

    test_basic_flow4:function (test) {

        var on_get_reached = false;
        var output_reached = false;
        var output_input = '';
        var _pi_expect = 'foo';
        var rs = new mock_rs({req_props:_pi_expect});

        var action = new NE.Action({

            name:'test3',

            on_get:function (rs) {
                on_get_reached = true;
                this.on_input(rs);
            },

            on_output:function (rs, input) {
                output_reached = true;
                output_input = input;
                // output short circuit
            }

        });

        action.validate(rs);
        //  console.log(' --- TEST BASIC FLOW4 --- output_input: %s', output_input);

        test.ok(on_get_reached, 'on_get was reached');
        test.ok(output_reached, 'output was reached');
        test.done();
    },

    test_basic_flow5:function (test) {

        var on_get_reached = false;
        var output_reached = false;
        var on_post_reached = false;
        var on_input_reached = false;

        var output_input = '';
        var _pi_expect = 'foo';
        var rs = new mock_rs({_method:'post', req_props:_pi_expect});

        var action = new NE.Action({

            name:'test3',

            on_get:function (rs) {
                on_get_reached = true;
                this.on_input(rs);
            },

            on_input:function (rs) {
                on_input_reached = true;
                // short circuit
            },

            on_post:function (rs) {
                on_post_reached = true;
                this.on_post_input(rs);
            },

            on_output:function (rs, input) {
                output_reached = true;
                output_input = input;
                // output short circuit
            }

        });

        action.validate(rs);
        // console.log(' --- TEST BASIC FLOW4 --- output_input: %s', output_input);

        test.ok(!on_get_reached, 'on_get was not reached');
        test.ok(!on_input_reached, 'on_input was not reached');
        test.ok(on_post_reached, 'on_post was reached');
        test.ok(output_reached, 'output was reached');
        test.done();
    },

    test_basic_flow6:function (test) {

        var output_reached = false;
        var output_input = '';
        var _pi_expect = 'foo';
        var _oi_expect = _pi_expect;
        var go_route = '';
        var messages = [];
        var rs = new mock_rs({req_props:_pi_expect,
            flash:function (type, msg) {
                messages.push({type:type, msg:msg});
            },
            go:function (route) {
                if (go_route) {
                    throw new Error('go_route called twice: first = '
                        + go_route + ', second = ' + route);
                }
                go_route = route; // expect to be catched in scope
            }});

        var action = new NE.Action({

            name:'test3',

            on_validate:function (rs) {
                this.on_validate_error(rs, 'on validate fail');
            },

            on_output:function (rs, input) {
                output_reached = true;
                output_input = input;
                rs.go('success');
            }

        });

        action.validate(rs);
        //  console.log(' --- TEST BASIC FLOW6 --- output_input: %s', output_input);

        test.ok(!output_reached, 'output was not reached');
        test.equals(output_input, '', 'process output not passed along');
        test.equals(go_route, '/', 'routed to home');

        test.done();
    },

    test_post_process_error:function (test) {

        var on_get_reached = false;
        var output_reached = false;
        var on_post_reached = false;
        var on_input_reached = false;

        var output_input = '';
        var _pi_expect = 'foo';
        var go_route = '';
        var post_error_route = '/err_route';
        var messages = [];

        var rs = new mock_rs({_method:'post', req_props:_pi_expect,
            flash:function (type, msg) {
                messages.push({type:type, msg:msg});
            },
            go:function (route) {
                if (go_route) {
                    throw new Error('go_route called twice: first = '
                        + go_route + ', second = ' + route);
                }
                go_route = route; // expect to be catched in scope
            }});

        var action = new NE.Action({

            name:'test3',

            on_get:function (rs) {
                on_get_reached = true;
                this.on_input(rs);
            },

            on_input:function (rs) {
                on_input_reached = true;
                // short circuit
            },

            on_post:function (rs) {
                on_post_reached = true;
                this.on_post_input(rs);
            },

            on_post_input:function (rs) {
                this.on_post_process(rs, {})
            },

            on_post_process:function (rs, input) {
                this.emit('process_error',rs, 'post process error')
            },

            on_output:function (rs, input) {
                output_reached = true;
                output_input = input;
                // output short circuit
            },

              _on_post_error_go: post_error_route

        });

        action.validate(rs);
        // console.log(' --- TEST BASIC FLOW4 --- output_input: %s', output_input);

        test.ok(!on_get_reached, 'on_get was not reached');
        test.ok(!on_input_reached, 'on_input was not reached');
        test.ok(on_post_reached, 'on_post was reached');
        test.ok(!output_reached, 'output was not reached');
        test.equals(go_route, post_error_route, 'go was sent to error');
        test.done();
    },

    test_error_routes_to_private_go_path:function (test) {

        var on_get_reached = false;
        var output_reached = false;
        var on_post_reached = false;
        var on_input_reached = false;

        var output_input = '';
        var _pi_expect = 'foo';
        var go_route = '';
        var go_error_route = '/err_route';
        var messages = [];

        var rs = new mock_rs({_method:'post', req_props:_pi_expect,
            flash:function (type, msg) {
                messages.push({type:type, msg:msg});
            },
            go:function (route) {
                if (go_route) {
                    throw new Error('go_route called twice: first = '
                        + go_route + ', second = ' + route);
                }
                go_route = route; // expect to be catched in scope
            }});

        var action = new NE.Action({

            name:'test3',

            on_get:function (rs) {
                on_get_reached = true;
                this.on_input(rs);
            },

            on_input:function (rs) {
                on_input_reached = true;
                // short circuit
            },

            on_post:function (rs) {
                on_post_reached = true;
                this.on_post_input(rs);
            },

            on_post_process:function (rs) {
                this.emit('process_error',rs, 'post process error')
            },

            _on_post_process_error_go:go_error_route,

            on_output:function (rs, input) {
                output_reached = true;
                output_input = input;
                // output short circuit
            }

        });

        action.validate(rs);
        // console.log(' --- TEST BASIC FLOW4 --- output_input: %s', output_input);

        test.ok(!on_get_reached, 'on_get was not reached');
        test.ok(!on_input_reached, 'on_input was not reached');
        test.ok(on_post_reached, 'on_post was reached');
        test.ok(!output_reached, 'output was not reached');
        test.equals(go_route, go_error_route, 'go was sent to error');
        test.done();
    }

}