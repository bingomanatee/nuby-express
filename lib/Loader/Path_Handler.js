var util = require('util');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var util = require('util');
var logger = require('./../utility/logger');
var Base = require('./../utility/Base');
var _debug = false;

function Path_Handler(config) {
    this.id();
    _.extend(this, config);
}

util.inherits(Path_Handler, Base);

var _path_handler_id = 0;

_.extend(Path_Handler.prototype, {

    CLASS:'Path_Handler',

    re:null,

    /**
     * Type can be 'file', 'dir', 'both', or 'other'.
     */
    type:'file',

    /**
     * Determines if this handlers is appropariate for this path.
     * Ostensibly returns a boolean, but as a convenience, will return the regex match
     * (if a match is made).
     * @param match_path
     */

    can_handle:function (match_path) {
        if (match_path) {
            var basename = path.basename(match_path);
            if (this.re) {
                var match = this.re.exec(basename);
                return match;
            } else if (this.filename) {
                return basename == this.filename;
            } else {
                logger.error({msg:'handler has no regex or filename to match path', match_path:match_path, handler:this});
            }
        } else {
            logger.error({msg:'handler passed empty path', handler:this.to_JSON()});
        }
    },

    handle:function (props) {
        var self = this;
        if (this.can_handle(props.full_path)) {
            logger.log({msg:'handler handling prop', handler:this, props:props.to_JSON()});
            props.loader.emit('on_pending_task', function (callback) {
                try {

                    logger.log({msg:'executing pending task', props:props});
                    self.execute(props, callback);
                } catch (er) {
                    logger.error(er);

                }
            }, props.full_path, self.name);
        }
    },

    execute:function (props, callback) {
        throw new Error('execute called on Path Handler. Must override abstract method: ' + match_path);
    },

    /* ************** REPORTING ************** */

    _JSON_report:require('./../utility/JSON_report'),
    to_JSON:function (switches) {
        var out = this._JSON_report(switches);
        out.type = this.type;
        out.filename = this.filename;
        out.re = this.re;
        return out;
    }

});

module.exports = Path_Handler;