var MockModel = require('../../../../lib/simple_model');

var dog_model = new MockModel({}, [
    {name:'Rex', id:1, gender:'M'},
    {name:'Spot', id:2, gender:'F'},
    {name:'Rover', id:3, gender:'M'},
    {name:'Daisy', id:4, gender:'F'}
]);

/**
 * dogs controller
 */

module.exports = {

    manifest: [{
        path:'rest',
        type:'rest'
    }],

    model:dog_model
}