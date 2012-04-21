

module.exports = function(res){
    if (!res){
        res = this.get_resources();
    }

    var self = this;

    res.forEach(function(item){
        switch (item.type){
            case 'mixin':
                break;

            case 'action_helper':
                if (self.CLASS = 'ACTION'){
                    if (!self.hasOwnProperty('helpers')){
                        self.helpers = {};
                    }
                    self.helpers[item.name] = item;
                }
                break;

            case 'model':

                if (!self.hasOwnProperty('models')){
                    self.models = {};
                }
                self.models[item.name] = item;

                break;

            default:

        }
    });
}