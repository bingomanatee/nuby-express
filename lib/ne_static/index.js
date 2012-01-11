/*!
 * Connect - staticProvider
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs')
    , path = require('path')
    , utils = require('./../../node_modules/express/node_modules/connect/lib/utils')
    , url = require('url')
    , _ = require('./../../node_modules/underscore')
    , util = require('util')
    , mime = require('./../../node_modules/express/node_modules/mime')
    , stream_file = require('./stream_file');

/**
 * Static file server with the given `root` path.
 *
 * Examples:
 *
 *     var oneDay = 86400000;
 *
 *     connect(
 *       connect.static(__dirname + '/public')
 *     ).listen(3000);
 *
 *     connect(
 *       connect.static(__dirname + '/public', { maxAge: oneDay })
 *     ).listen(3000);
 *
 * Options:
 *
 *    - `maxAge`   Browser cache maxAge in milliseconds. defaults to 0
 *    - `hidden`   Allow transfer of hidden files. defaults to false
 *    - `redirect`   Redirect to trailing "/" when the pathname is a dir
 *
 * @param {String} root
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function static(options) {

    // root required
    if (!options || !options.contexts) throw new Error('static() context required');

    return function static(req, res, next) {
        var opts = {getOnly:true};
        _.extend(opts, options);
        send(req, res, next, opts);
    };
};

/**
 * Expose mime module.
 */

exports.mime = mime;

/**
 * Attempt to tranfer the requseted file to `res`.
 *
 * @param {ServerRequest}
    * @param {ServerResponse}
    * @param {Function} next
 * @param {Object} options
 * @api private
 */

var send = exports.send = function (req, res, next, options) {
    options = options || {};
    if (!options.contexts) throw new Error('contexts required');

    // setup
    var  get = 'GET' == req.method
        , redirect = false === options.redirect ? false : true
        , getOnly = options.getOnly
        , fn = options.callback
        , scan_done = false
        , head = 'HEAD' == req.method
        , bad = false;

    // parse url
    var opt_url = url.parse(req.url);
    var url_path = decodeURIComponent(opt_url.pathname);
    var url_suffix;
    var type;

    // null byte(s)
    if (~url_path.indexOf('\0')) {
        scan_done = true;
        bad = true;
    }

    // replace next() with callback when available
    if (fn) next = fn;

    for (i = 0; (i < options.contexts.length) && (!scan_done); ++i) {

        var context = options.contexts[i];

        var ctxGetOnly = context.getOnly;

        // ignore non-GET requests
        if (!get && !head && ctxGetOnly && getOnly) {
            continue;
        }

        if (!context.root) {
            continue;
        }

        // "hidden" file
        if (!options.hidden && '.' == path.basename(url_path)[0]) {
            continue;
        }

        if (context.prefix) {
            if (url_path.substr(0, context.prefix.length) != context.prefix) {
                continue;
            }
            url_suffix = url_path.substr(context.prefix.length);
        } else {
            url_suffix = url_path;
        }

        var file_path = path.normalize(path.join(context.root, url_suffix));

        if (!(file_path.indexOf(context.root) == 0)) {
            continue;
        }

        if (path.existsSync(file_path)) {
            try {
                var stat = fs.statSync(file_path);
                if (stat.isFile()) {
                    stream_file(file_path, req, res, fn, options, stat);
                    scan_done = true;
                }
            } catch (err) {
                // ignore ENOENT
                if (err) {
                    if (fn) return fn(err);
                    return 'ENOENT' == err.code
                        ? next()
                        : next(err);
                    // redirect directory in case index.html is present
                }
            }
        } // @TODO: accept dirs
    }

    if (scan_done) {
    } else if (bad) {
        utils.badRequest(res);
    } else {
        next();
    }

};

