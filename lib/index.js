module.exports = {

    deps: {

        express: require('./../node_modules/express'),

        ejs: require('./../node_modules/ejs'),

        mongoose: require('./../node_modules/mongoose'),

        support: require('./../node_modules/support')
    },

    Loader: require('./Loader'),

    Framework: require('./Framework'),

    Resource: require('./Resource'),

    Component: require('./Component'),

    Controller: require('./Controller'),

    Action: require('./Action'),

    helpers: {
        View: require('./Helpers/View')
    },

    handlers: require('./handlers'),

    Multi_Static: require('./Multi_Static'),

    Path_Handler: require('./Loader/Path_Handler'),

    utility:  require('./utility'),

    log: require('./utility/logger'),

    Req_State: require('./Req_State'),

    Req_State_Mock: require('./Req_State/Mock')

};