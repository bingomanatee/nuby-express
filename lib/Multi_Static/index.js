/*!
 * Connect - staticProvider
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var utils = require('./utils');
var _ = require('underscore');
var url_lib = require('url');
var util = require('util');
var mime = require('mime');

var _DEBUG = false;
var _DEBUG_SHORT = false;

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

function _no_frame(o){
    var c = _.clone(o);
    delete c.frame;
    return c;
}

exports = module.exports = function multi_static(options) {
    if (!options.frame) {
        throw new Error('multi_static requires frame in options');
    }

    // root required
    //  if (!root) throw new Error('static() root path required');
    //options.root = root;

    if (_DEBUG){
        console.log('MULTI STATIC options set to %s', util.inspect(_no_frame(options)));
    }

    return function static(req, res, next) {
        options.path = req.url;
        options.getOnly = true;
        send(options.frame, req, res, next, options);
    };
};

/**
 * Expose mime module.
 */

exports.mime = mime;

/**
 * Respond with 416  "Requested Range Not Satisfiable"
 *
 * @param {ServerResponse} res
 * @api private
 */

function invalidRange(res) {
    var body = 'Requested Range Not Satisfiable';
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Length', body.length);
    res.statusCode = 416;
    res.end(body);
}

/**
 * Attempt to tranfer the requseted file to `res`.
 *
 * @param {ServerRequest}
    * @param {ServerResponse}
    * @param {Function} next
 * @param {Object} options
 * @api private
 */

var send = exports.send = function (frame, req, res, next, options) {
    options = options || {};
    if (!options.path) {
        throw new Error('path required');
    }

    // setup
    var ranges = req.headers.range
        , head = 'HEAD' == req.method.toUpperCase()
        , get = 'GET' == req.method.toUpperCase()
        , framework = options.frame
        , getOnly = options.getOnly
        , hidden = options.hidden
        , fn = options.callback
        , done;

    var url = url_lib.parse(options.path);
    // replace next() with callback when available
    if (fn) {
        next = fn;
    }

    // ignore non-GET requests
    if (getOnly && !get && !head) {
        // if (_DEBUG) console.log('non_head non_get; going to next');
        return next();
    }

    // parse url
    var  pathname = decodeURIComponent(url.pathname);

    if (_DEBUG || _DEBUG_SHORT) console.log('MULTI-STATIC: serving %s', pathname);

    // null byte(s)
    if (~pathname.indexOf('\0')) {
        if (_DEBUG) console.log('bad request');
        return utils.badRequest(res);
    }


    // when root is not given, consider .. malicious
    if (~pathname.indexOf('..')) {
        if (_DEBUG) console.log('forbidden');
        return utils.forbidden(res);
    }

    //@TODO: manage path that is not at root

    // index.html support
    if (path.normalize('/') == pathname[pathname.length - 1]) {
        pathname += 'index.html';
    }

    // "hidden" file
    if (!hidden && '.' == path.basename(pathname)[0]) {
        return next();
    }


    // join / normalize from optional root dir
    var pathnames = framework.public_paths(pathname);
    if (_DEBUG) console.log('pathnames: %s', util.inspect(pathnames));

    function _try_pathname(err) {

        if (!pathnames.length) {
            if (_DEBUG) console.log('done - returning: err = %s', err ? err.toString() : '');
            return next(err);
        }

        var path_data = pathnames.shift();

        fs.stat(path_data.full_path, function (err, stat) {
            if (err) {
                if (_DEBUG) console.log('STAT err: %s', util.inspect(err));
                _try_pathname(('ENOENT' == err.code) ? null: err);
            } else {
                _route_path(req, res, next, options, path_data.full_path, stat);
            }
        });
    }

    _try_pathname();
};

function _route_path(req, res, next, options, pathname, stat) {
  //   if (_DEBUG) console.log('routing path %s', pathname);

    var ranges = req.headers.range;
    var fn = options.callback;
    var url = url_lib.parse(options.path);

    if (_DEBUG) console.log('>>>> _route_path PATH NAME: %s', pathname);

    if (stat.isDirectory()) {
        if (!(false !== options.redirect)) {
            return next();
        }
        res.statusCode = 301;
        res.setHeader('Location', url.pathname + '/');
        res.end('Redirecting to ' + url.pathname + '/');
        return;
    }

    // header fields
    _set_headers(req, res, stat, pathname, options);

    // conditional GET support
    if (utils.conditionalGET(req)) {
        if (!utils.modified(req, res)) {
            req.emit('static');
            return utils.notModified(res);
        }
    }

    var opts = {};
    var chunkSize = stat.size;

    // we have a Range request
    if (ranges) {
        ranges = utils.parseRange(stat.size, ranges);
        // valid
        if (ranges) {
            // TODO: stream options
            // TODO: multiple support
            opts.start = ranges[0].start;
            opts.end = ranges[0].end;
            chunkSize = opts.end - opts.start + 1;
            res.statusCode = 206;
            res.setHeader('Content-Range', util.format('bytes %s-%s/%s', opts.start, opts.end, stat.size));
            // invalid
        } else {
            return fn
                ? fn(new Error('Requested Range Not Satisfiable'))
                : invalidRange(res);
        }
    }

    res.setHeader('Content-Length', chunkSize);
    if (_DEBUG) console.log('HEADERS: %s', util.inspect(res._headers));

    // transfer
    if ('HEAD' == req.method.toUpperCase()) {
        if (_DEBUG) console.log('head: sending end');
        return res.end();
    }

    // stream
    var stream = fs.createReadStream(pathname, opts);
    req.emit('static', stream);
    stream.pipe(res);

    if (_DEBUG || _DEBUG_SHORT){
        console.log('.. SERVING LOCAL FILE %s', pathname);
    }
    // callback
    if (fn) {
        function callback(err) { done || fn(err); done = true }
        req.on('close', callback);
        stream.on('end', callback);
    }
}

function _set_headers(req, res, stat, pathname, options) {
    if (_DEBUG) console.log('setting headers with %s', util.inspect(options));
    _.each({
        Date:utils.utc_date_string,
        'Cache_control':function () {
            var maxAge = maxAge = options.maxAge || 0;
            if (_DEBUG)  console.log('max age found: %s', maxAge);
            return   'public, max-age=' + (maxAge / 1000)
        },
        'Last-Modified':function () {
            return stat.mtime.toUTCString();
        },
        ETag:function () {
           return utils.etag(stat)
        },
        'content_type':function () {
            // mime type
            var type = mime.lookup(pathname);
            var charset = mime.charsets.lookup(type, 'text/plain');
            return type + charset ? '; charset=' + charset : '';
        },
        'Accept-Ranges':'bytes'
    }, function (maker, key) {
        if (_DEBUG) console.log('maker: %s, key: %s', util.inspect(maker), util.inspect(key));
        if (!res.getHeader(key)) {
            if (key == 'content-type') {
                key = 'Content-Type';
            }
            var value = _.isFunction(maker) ? maker() : maker;
            res.setHeader(key, value);
            if (_DEBUG){
                console.log('%s set to %s', key, value);
            }
        }
    });
}
