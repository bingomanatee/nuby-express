
var handlers = {
    name:'handlers',
    Resources:require('./Resources'),
    Resource_Types:require('./Resource_Types'),
    Resource_Type:require('./Resource_Type'),
    Resource_Type_Dir:require('./Resource_Type_Dir'),
    Config:require('./Config'),
    Components:function () {
        return require('./Components')();
    },
    Component:function () {
        return require('./Component')();
    }
}

module.exports = handlers;