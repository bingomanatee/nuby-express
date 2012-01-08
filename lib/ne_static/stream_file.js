var fs = require('fs')
    , path = require('path')
    , utils = require('./../../node_modules/express/node_modules/connect/lib/utils')
    , Buffer = require('buffer').Buffer
    , parse = require('url').parse
    , _ = require('./../../node_modules/underscore')
    , util = require('util')
    , mime = require('./../../node_modules/express/node_modules/mime');


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

module.exports = function stream_file( file_path, req, res, fn, options, stat) {
    var maxAge = options ? options.maxAge || 0 : 0;
    var head = 'HEAD' == req.method;
    var done = false;
    if (!stat){
        stat = fs.statSync(file_path);
    }

    // mime type
    var type = mime.lookup(file_path);

    // header fields
    if (!res.getHeader('Date')) res.setHeader('Date', new Date().toUTCString());
    if (!res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'public, max-age=' + (maxAge / 1000));
    if (!res.getHeader('Last-Modified')) res.setHeader('Last-Modified', stat.mtime.toUTCString());
    if (!res.getHeader('ETag')) res.setHeader('ETag', utils.etag(stat));
    if (!res.getHeader('content-type')) {
        var charset = mime.charsets.lookup(type);
        res.setHeader('Content-Type', type + (charset ? '; charset=' + charset : ''));
    }
    res.setHeader('Accept-Ranges', 'bytes');

    // conditional GET support
    if (utils.conditionalGET(req)) {
        if (!utils.modified(req, res)) {
            req.emit('static');
            return utils.notModified(res);
        }
    }

    var opts = {};
    var chunkSize = stat.size;
    var ranges = req.headers.range;

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
            res.setHeader('Content-Range',
                util.format('bytes %s-%s/%s', opts.start, opts.end, stat.size));
            // invalid
        } else {
            return fn
                ? fn(new Error('Requested Range Not Satisfiable'))
                : invalidRange(res);
        }
    }

    res.setHeader('Content-Length', chunkSize);

    // transfer
    if (head) return res.end();

    // stream
    var stream = fs.createReadStream(file_path, opts);
    req.emit('static', stream);
    stream.pipe(res);

    // callback
    if (fn) {
        function callback(err) {
            done || fn(err);
            done = true
        }

        req.on('close', callback);
        stream.on('end', callback);
    }
}