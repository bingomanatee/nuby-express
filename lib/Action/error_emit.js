var util = require('util');
var _ = require('underscore');
var path = require('path');
var _DEBUG = false;
var Req_State = require('./../Req_State');
var Req_State_Mock = require('./../Req_State/Mock');
/* *********************** REDIRECT PATH ******************* */

/**
 * you can define redirection paths in a variety of formats:
 *   _on_get_input_error_go
 *   _on_input_error_go
 *   _on_get_error_go
 *   _on_error_go
 *
 * _on_error_go will define a universal route for all errors.
 * Setting any of these values to true will cause the response to be a JSON message rather than an action redirect.
 *
 * @param rs: Req_State
 * @param type:String
 * @param method:String
 * @param action: Action
 * @return {*}
 * @private
 */
function _go_path(rs, props) {

    var paths = ['_on_error_go'];
    if (props.method && props.type) {
        paths.unshift(util.format('_on_%s_%s_error_go', props.method, props.type));
    }
    if (props.method) {
        paths.unshift(util.format('_on_%s_error_go', props.method));
    }
    if (props.type) {
        paths.unshift(util.format('_on_%s_error_go', props.type));
    }

    var error_path = _.find(paths, function (p) {
        return (props.action.hasOwnProperty(p) && props.action[p]);
    })

    return error_path ? props.action[error_path] : true;
}

/* ************************ ERROR MESSAGE FORMATTING ********************** */

var _err_template = _.template("<%= message %> <% if (line) { %>\n" +
    "  --- [line <%= line %> of <%= filename %><% } %> --- \n" +
    "    TYPE: <%= type %>\n" +
    "    METHOD: <%= method %>\n" +
    "    URL: <%= url %>");

function _console_log_error_message(err) {
    if (_.isString(err)) {
        return err;
    } else {
        return _err_template(err);
    }
}

function _message(err) {
    if (_.isString(err)) {
        var out = err;
    } else if (err.message){
        var out = err.message;
    } else {
        var out = util.inspect(err);

    }

    if (_DEBUG) console.log('_message returning >>>> %s', out);
    return out;
}

/* *********************** RESPONSE HANDLERS ********************** */

function _error(target, rs, err, props) {
    if (!props) {
        props = {};
    }

    if (_DEBUG)  {
        console.log('target class: %s', target.CLASS);
        console.log('rs class: %s', rs.CLASS);
    }

    if (target.CLASS == 'Req_State'){
        props = err;
        err = rs;
        rs = target;
        if (_DEBUG){ console.log('shifting parameters: error is now %s', err)}
    }

    if ((!rs instanceof Req_State) && (!!rs instanceof Req_State_Mock)) {
        throw new Error('bad Req_State %s', util.inspect(rs, false, 0));
    }

    if (_DEBUG) console.log('_error(target = %s, rs = %s, err = %s, props = %s) -----  this = %s',
        util.inspect(target, false, 0).substr(0, 20) +'...',
        util.inspect(rs, false, 0).substr(0, 20) +'...',
        util.inspect(err),
        util.inspect(props).substr(0,40) + '...', this.path);
    if (!props.method) props.method = target.my_method ? target.my_method : rs.method();
    if (!props.action) props.action = target.my_action ? target.my_action : this;
    if (!props.type) props.type = target.my_type ? target.my_type : '';
    if (!props.go) props.go = _go_path(rs, props);
    if (!props.url) props.url = rs.req.url;

    var msg = _message(err);

    if (_DEBUG) console.log(' ------------ emmitting error %s --------------', msg);
    try {
        this.emit('error_response', rs, msg, props);
    } catch (err) {
        console.log(' ----------- emit error ---------: %s, target %s', err.message, util.inspect(target));
    }
}

/**
 * echoes error data to the console.
 *
 * @param rs: Req_State
 * @param err: String | Error
 * @param props: Object
 * @private
 */
function _console_log_error(target, rs, err, props) {
    if (_DEBUG) {
        console.log('_console_log_error(%s, %s, %s)', rs.CLASS, util.inspect(err), util.inspect(props));
    }

    if (!props.method) {
        props.method = rs.method();
    }
    if (!props.action) {
        props.action = this;
    }
    if (!props.url) {
        props.url = rs.req.url;
    }

    console.log('************** NE APPLICATION ERROR:\n    %s \n******************', _console_log_error_message(err));
}

/**
 * handles redirection or response to an error. Triggered downstream by _error
 *
 * @param rs: Req_State
 * @param error_message: String
 * @param props: Object
 * @private
 */
function _error_response(rs, error, props) {

    if ((!rs instanceof Req_State) || (rs instanceof Req_State_Mock)) {
        throw new Error('bad Req_State %s', util.inspect(rs, false, 0));
    }

    if (_DEBUG) {
        try {
            console.log('_error_response( req_state = %s, error = %s, props =%s): this = %s',
                rs.CLASS, util.inspect(error), util.inspect(props).substr(0, 50) + '...', this.path);
        } catch (err) {
            console.log('--- responding to error --- ')
        }
    }

    if (_DEBUG) console.log('go: %s', props.go)
    if (props.go === true) { // note - no flashing in this context
        if (_DEBUG) console.log('... direct send');
        try {
            rs.send(_.defaults({error:error }, props));
        } catch (err) {
            rs.send({error:error});
        }
    } else {
        rs.flash('error', props.flash ? props.flash : error);
        rs.go(props.go);
    }
}

/* ************************** MODULE ************************* */

module.exports = {
    listen_to_errors:function () {
        // both of these handlers trigger on an error.
        this.on('error', _.bind(_console_log_error, this, {action:this}));
        this.on('error', _.bind(_error, this, {my_action:this, my_method:false, my_type:false}));

        // these handlers are "sugar" shorthand that are alternate syntax for the generic error.
        this.on('get_error', _.bind(_error, this, {my_action:this, my_method:'get', my_type:false}));
        this.on('post_error', _.bind(_error, this, {my_action:this, my_method:'post', my_type:false}));
        this.on('put_error', _.bind(_error, this, {my_action:this, my_method:'put', my_type:false}));
        this.on('delete_rror', _.bind(_error, this, {my_action:this, my_method:'delete', my_type:false}));

        // these handlers are "sugar" shorthand that are alternate syntax for the generic error.
        this.on('validate_error', _.bind(_error, this, {my_action:this, my_method:false, my_type:'validate'}));
        this.on('validation_error', _.bind(_error, this, {my_action:this, my_method:false, my_type:'validate'}));
        this.on('input_error', _.bind(_error, this, {my_action:this, my_method:false, my_type:'input'}));
        this.on('process_error', _.bind(_error, this, {my_action:this, my_method:false, my_type:'process'}));
        this.on('output_error', _.bind(_error, this, {my_action:this, my_method:false, my_type:'output'}));

        this.on('error_response', _.bind(_error_response, this)); // this is a secondary response to action_error.


    }
}