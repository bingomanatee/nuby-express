module.exports = function (root, name, prefix, frame) {
    var data = {
        type:'static_route',
        name: name,
        prefix:prefix,
        root:root};
    frame.add_resource(data);
}