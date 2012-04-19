var Req_State = require('./../../Req_State');
var _ = require('underscore');
var make_path = require('./../../utility/file_finder');

function Base_Template() {
}

_.extend(
    Base_Template.prototype,
    {
        after_load:function () {
            this.type = 'base';
        },

        respond:function (req, res) {
            var rs = new Req_State(req, res, this, this.controller, this.framework);
            this.validate(rs);
        },

        /* *************** VIEW TEMPLATE ***************** */

        _page_template:false,

        /**
         * returns either the teplate FUNCTION(if no props passed) or a string produced by the template (if props passed).
         * If the template varies by context, overwrite this method and use the rs to calculate the response.
         *
         * @param rs: Req_State
         * @param template_props
         */
        page_template:function (rs, template_props) {
            if (_.isString(rs)) {
                return this.dyn_template(rs, template_props);
            }

            if (!this._page_template) {
                this._page_template = this.framework.make_view(this.page_template_path());
            }

            return template_props ? this._page_template(template_props) : this._page_template;
        },

        _ptp_props: [
            'view.html',
            '%s_view.html',
            'view.xml',
            '%s_view.xml',
            'view.json',
            '%s_view.json'
        ],

        page_template_path: function(){
           var template_path = file_finder(this.path, this._ptp_props, this.name());
        },

        dyn_template:function (template_str, template_props) {
            var dynamic_template = this.framework.make_view(template_str);
            if (template_props) {
                return dynamic_template(template_props);
            } else {
                return dynamic_template;
            }
        },

        /* *************** RESPONSE METHODS ************** */

        validate:function (rs) {
            this.route(rs);
        },

        route:function (rs) {
            var method = rs.method.toUpperCase();

            switch (method) {
                case 'get':
                    if (this.hasOwnProperty('on_get')) {
                        return this.on_get(rs);
                    }
                    break;

                case 'post':
                    if (this.hasOwnProperty('on_post')) {
                        return this.on_post(rs);
                    }
                    break;

                case 'put':
                    if (this.hasOwnProperty('on_put')) {
                        return this.on_put(rs);
                    }
                    break;


                case 'delete':
                    if (this.hasOwnProperty('on_delete')) {
                        return this.on_delete(rs);
                    }
                    break;

            }

            this.on_respond(rs);
        },

        on_respond:function (rs) {
            var self = this;

            self.on_input(rs);
        },

        on_input:function (rs) {
            this.on_process(rs, {})
        },

        on_process:function (rs, input) {
            this.on_output(rs, {});
        },

        on_output:function (rs, output) {
            rs.send(output);
        }

    }
);

module.exports = Base_Template;