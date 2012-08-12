var util = require('util');
var _ = require('underscore');
var Req_State = require('./../Req_State');
var _DEBUG_ROUTE = false;

/* **************** METHOD PIPELINE *************** */

var _method_pipeline = {};

['', 'get', 'put', 'post', 'delete'].forEach(function (method) {
    var input_method_name = util.format('on_%s_input', method);
    var process_method_name = util.format('on_%s_process', method);
    var output_process_name = util.format('on_%s_output', method);

    _method_pipeline[input_method_name] = function (rs) {
        if (!rs) {
            throw new Error('no rs in ' + input_method_name)
        }
        this[process_method_name](rs, rs.req_props);
    }

    _method_pipeline[process_method_name] = function (rs, input) {
        this[output_process_name](rs, input);
    }

    _method_pipeline[output_process_name] = function (rs, input) {
        this.on_output(rs, input);
    }
})

var flow = {

    /* *************** RESPONSE METHODS ************** */

    /* ********************** VALIDATE ********************** */

    validate:function (rs) {
        if (rs.timer) {
            rs.add_time('validating');
        }
        var method = rs.method().toLowerCase();
        switch (method) {
            case 'get':
                if (this.on_get_validate) {
                    return this.on_get_validate(rs);
                }
                break;

            case 'post':
                if (this.on_post_validate) {
                    return this.on_post_validate(rs);
                }
                break;

            case 'put':
                if (this.on_put_validate) {
                    return this.on_put_validate(rs);
                }
                break;


            case 'delete':
                if (this.on_delete_validate) {
                    return this.on_delete_validate(rs);
                }
                break;

        }

        this.on_validate(rs);
    },

    on_validate:function (rs) {
        this.on_route(rs);
    },

    /* ********************** ROUTE ******************** */

    on_route:function (rs) {
        if (rs.timer) {
            rs.add_time('routing');
        }
        var method = rs.method().toLowerCase();
        //  console.log('routing %s', method);
        switch (method) {
            case 'get':
                if (this.on_get) {
                    return this.on_get(rs);
                }
                break;

            case 'post':
                if (this.on_post) {
                    return this.on_post(rs);
                }
                break;

            case 'put':
                if (this.on_put) {
                    return this.on_put(rs);
                }
                break;


            case 'delete':
                if (this.on_delete) {
                    return this.on_delete(rs);
                }
                break;

        }

        this.on_input(rs);
    },

    /* ************** *ON INPUT ***************** */

    on_input:function (rs) {
        this.on_process(rs, rs.req_props);
    },

    /* ***************** ON PROCESS ***************** */

    on_process:function (rs, input) {
        this.on_output(rs, input);
    },

    /* ************************** OUTPUT *********************** */

    on_output:function (rs, output) {
        if (!rs) {
            throw new Error('output called with no rs');
        }
        var template = this.page_template_path();
        if (_DEBUG_ROUTE) console.log('action: %s(%s), template: %s', this.name, this.path, template);
        if (template) {
            rs.render(template, output);
        } else {
            rs.send(output);
        }
    }
};

_.extend(flow, _method_pipeline);

module.exports = flow;