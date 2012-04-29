var util = require('util');
var _ = require('underscore');
var Loader = require('./../Loader');
var path = require('path');
var config_handler = require('./../handlers/Config');
var ress_handler = require('./../handlers/Resources');
var heritage = require('./../utility/heritage');
var digest_config = require('./../utility/digest_config');
var Gate = require('support/gate');
var ensure_name = require('./../utility/ensure_name');
var get_config = require('./../utility/get_config');
var public_handler = require('./handlers/Public');
var views_handler = require('./handlers/View');

function Layout(config) {
    digest_config(this, config, true);
    this._init_handlers();
    ensure_name(this, /^(layout_)?(.*)$/);
}

util.inherits(Layout, Loader);

_.extend(Layout.prototype, {
    CLASS:'LAYOUT',
    heritage:heritage,
    get_config: get_config,

    /* ************* LOADING ****************** */

    _init_handlers:function () {

        this.add_handler(public_handler(this));
        this.add_handler(views_handler(this));
        this.add_handler(config_handler());
        this.add_handler(ress_handler());
    },

    on_load_done:function () {
        if (!this.name) {
        
        }
    },

    /* ************* PUBLIC PATH ************* */

    public_path: '',

    set_public_path: function(pp){
        this.public_path = '';
    }

});

module.exports = Layout;