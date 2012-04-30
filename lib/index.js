

module.exports = {

    Loader: require('./Loader'),

    Framework: require('./Framework'),

    Resource: require('./Resource'),

    Component: require('./Component'),

    Contorller: require('./Controller'),

    Action: require('./Action'),

    helpers: {
        View: require('./Helpers/View')
    },

    Path_Handler: require('./Loader/Path_Handler'),

    multi_static: require('./Multi_static')

}