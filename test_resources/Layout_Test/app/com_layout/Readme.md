A layout component for nuby-exress.js. 

## nuby-express.js Layouts

One or more layouts can be created in a "layout" folder. This folder can exist in any component, including the root of the NE project. 

### Required:

 * *view/template.html* : the actual template: must have a `<%- body %>` insert. the _*view*_ directory can contain other bound templates.

## Optional: 

 * *config.json* : a JSON file with the following (optional) properties: 
 *  * *name* : (string) the name by which the layout can be called in actions; by default, the name of the layout folder
 *  * *prefix_path* : the URL prefix to static files in the (optional) public folder. 
 
 * _*public*_ : a directory of static resources, optionally prefixed by the configuration above. 
 
## Scope

Layouts, once loaded, can be accessed by any action in the project. There is no cross-component namespacing of layouts, so uniqueness of layouts has to be enforced by you.

-------

