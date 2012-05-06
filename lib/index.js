

module.exports = {

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

    Multi_Static: require('./Multi_static'),

    Path_Handler: require('./Loader/Path_Handler'),

    Layout: require('./Layout')

}