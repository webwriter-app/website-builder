# WebWriter Widget

## Documentation

### To create a new component: 
    - add a component file under ./src/components
    - provide a type and the render() method that displays the html
    - register the component under ./src/registry.ts
    - the first argument needs to be the string name of the component (e.g. "h1", this is the name you're referencing it with in ./src/webwriter-website-builder.ts) and the exported type of the component
    - reference your component inside ./src/webwriter-website-builder.ts with the data-component-type="..." attribute