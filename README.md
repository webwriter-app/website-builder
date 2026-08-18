# Website Builder (`@webwriter/website-builder@1.0.0`)
[License: MIT](LICENSE) | Version: 1.0.0

Build, explore and understand static websites with different layouts (Freeform, Flow, Flex, Grid).

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Flex Starter | `@webwriter/website-builder/snippets/flex-starter.html` |
| Flex Advanced | `@webwriter/website-builder/snippets/flex-advanced.html` |
| Grid Starter | `@webwriter/website-builder/snippets/grid-starter.html` |
| Grid Advanced | `@webwriter/website-builder/snippets/grid-advanced.html` |
| Freeform Starter | `@webwriter/website-builder/snippets/freeform-starter.html` |
| Freeform Advanced | `@webwriter/website-builder/snippets/freeform-advanced.html` |
| Flow Starter | `@webwriter/website-builder/snippets/flow-starter.html` |
| Flow Advanced | `@webwriter/website-builder/snippets/flow-advanced.html` |



## `WebwriterWebsiteBuilder` (`<webwriter-website-builder>`)


### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/website-builder/widgets/webwriter-website-builder.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/website-builder/widgets/webwriter-website-builder.js"></script>
<webwriter-website-builder></webwriter-website-builder>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/website-builder
```

```html
<link href="@webwriter/website-builder/widgets/webwriter-website-builder.css" rel="stylesheet">
<script type="module" src="@webwriter/website-builder/widgets/webwriter-website-builder.js"></script>
<webwriter-website-builder></webwriter-website-builder>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `wwState` (`ww-state`) | `string` | Saves the widget data in an attribute | `""` | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `setActiveNodes` | Set the freeform or ordered nodes array, depending on the current layout mode | `next: BuilderNode[]`
| `normalizeOrder` | Sets the order attribute of each node to its position in the array | -
| `selectNodeId` | Select a node based on its id | `id: string`
| `clearSelection` | Clear the selection of nodes | -
| `getSelectedNode` | Get the BuilderNode object of the selected node, if a node is selected | -
| `updateNode` | Update the node with given id using a (partial) BuilderNode object | `id: string`, `patch: Partial<BuilderNode>`
| `deleteSelectedNode` | Delete the selected node | -
| `blurActive` | Blur the active element | -
| `isEditingWithinComponent` | Returns whether the focus is currently on an element that accepts typing text | -
| `isInteractiveTarget` | Returns whether the event target is an "interactive" element, that requires clicking for interaction | `target: EventTarget | null`
| `allowInteractEvent` | Returns whether the interact key is pressed | `_e: any`
| `selectNodeFromWrapper` | Select node from a wrapper click. Prevents link navigation unless ctrl/meta held.<br>Uses _allowInteract (ctrl/meta key), NOT allowInteractEvent (A key). | `e: MouseEvent`, `id: string`
| `isAuthorMode` | Whether the widget is currently in author mode (contenteditable) | -
| `isStudentMode` | Whether the widget is currently in student mode | -
| `gridPlacementFromPointer` | Get grid placement from pointer position | `root: HTMLElement`, `clientX: number`, `clientY: number`
| `getPaletteItems` | Returns sorted, filtered list of component type IDs for the palette | -
| `quickAdd` | Quickly add a node by type via the elements palette | `type: string`
| `groupSelected` | Group the selected nodes | -
| `ungroupContainer` | Ungroups the selected group of nodes | `containerId: string`
| `setCodeTabVisible` | Set visibility of the code tab | `tab: CodeTab`, `visible: boolean`
| `openAllComponentsDialog` | Open the all components dialog | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, custom CSS properties, or CSS parts.*


---
*Generated with @webwriter/build@1.9.1*