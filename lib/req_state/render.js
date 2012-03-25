var util = require('util');
var _ = require ('underscore');

function _debug(msg, param, a, b) {
    return;
    if (param) {
        msg = util.format(msg, param, a, b);
    }
    console.log('REQ_STATE - render:: %s', msg);
}

module.exports = function (render_path) {
        var self = this;

        function _render_closure(err, values) {
            // console.log('rc values: %s', util.inspect(values));
            var render_params = values.render;
            if (!(_.isNull(values.layout))) {
                // false is a valid value
                render_params.layout = values.layout;
            }

            if (values.flash_keys && (values.flash_keys.length)) {
                values.flash_keys.forEach(function (key) {
                    render_params[key] = self.req.flash(key);
                });
            }

            function _do_render() {
                self.res.render(render_path, render_params);
            }

         //   _debug('_render Closure with rs = %s', util.inspect(self, null, 1));
            if (values.layout_id) {
                //     console.log('loading layout id %s', values.layout_id);
                if (self.framework.layouts.hasOwnProperty(values.layout_id)) {
                    var layout_obj = self.framework.layouts[values.layout_id];
                    render_params.layout = layout_obj.template;
                    if (layout_obj.hasOwnProperty('on_render')) {
                        layout_obj.on_render(self, render_params, _do_render);
                    } else {
                        _do_render();
                    }
                } else {
                    throw new Error('cannot find layout id ' + values.layout_id);
                }
            } else {
                _do_render();
            }

        }

        /**
         * @TODO: better error responsiveness
         *
         * @param err
         * @param values
         */

        function _on_params(err, values) {
            var closures = [_render_closure];
            if (self.controller.hasOwnProperty('render_filters') && self.controller.render_filters.length) {
                _debug('adding %s controller.render_filters', self.controller.render_filters.length);
                closures = self.controller.render_filters.concat(closures);
            }
            if (self.framework.render_filters.length) {
                _debug('adding %s framework.render_filters', self.framework.render_filters.length);
                closures = self.framework.render_filters.concat(closures);
            }

            function _next_callback(err, values) {
                var cb;
                while (closures.length && (!_.isFunction(cb))) {
                    cb = closures.shift();
                }
                if (cb) {
                    _debug('render callback: %s, values: %s', cb.toString(), util.inspect(values));
                    cb(err, values, _next_callback, self);
                }
            }

            _next_callback(err, values);
        }

        this.get_params([
            {what:'render', absent:{}},
            {what:'flash_keys', absent:[]},
            {what:'layout_id', absent:null},
            {what:'layout', absent:null}
        ],
            _on_params
        );
    }