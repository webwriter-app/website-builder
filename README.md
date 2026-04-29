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
| `drag` | - | Handles all drag-and-drop logic | `new DragController(this)` | ✗ |
| `selection` | - | Handles node selection, multi-select, drill-in (double-click), and canvas click | `new SelectionController(this)` | ✗ |
| `keyboard` | - | Handles all keyboard shortcuts | `new KeyboardController(this)` | ✗ |
| `layout` | - | Handles layout mode switching and global flex/grid settings | `new LayoutController(this)` | ✗ |
| `wwState` (`ww-state`) | `string` | Saves the widget data in an attribute | `""` | ✗ |
| `layoutMode` | `LayoutMode` | The selected layout mode (freeform, flow, flex or grid) | `"freeform"` | ✗ |
| `freeformNodes` | `BuilderNode[]` | The website element nodes for freeform layout | `[]` | ✗ |
| `orderedNodes` | `BuilderNode[]` | The ordered website element nodes for flow, flex or grid layout | `[]` | ✗ |
| `flexSettings` | `FlexSettings` | Configuration of the flex layout | - | ✗ |
| `gridSettings` | `GridSettings` | Configuration of the grid layout | - | ✗ |
| `canvasBackground` | `string` | Background color of the canvas, as an RGB hex code | `"#ffffff"` | ✗ |
| `selectedNodeId` | `string \| null` | The id of the selected node | `null` | ✗ |
| `selectedElement` | `HTMLElement \| null` | The selected HTML element | `null` | ✗ |
| `selectedIds` | `Set<string>` | Set of all selected node ids | `new Set()` | ✗ |
| `focusedContainerId` | `string \| null` | The id of the focused container | `null` | ✗ |
| `shiftPressed` | `boolean` | Whether shift is currently pressed | `false` | ✗ |
| `interactKeyPressed` | `boolean` | Whether the interact key ("A") is currently pressed | `false` | ✗ |
| `gridKeyPressed` | `boolean` | Whether the grid key ("G") is currently pressed | `false` | ✗ |
| `toolbarKeyHidden` | `boolean` | Whether the hide toolbar key ("T") is currently pressed | `false` | ✗ |
| `showGrid` | `boolean` | Whether the grid overlay should be shown all the time | `false` | ✗ |
| `gridSize` | `number` | The size of the overlay grid | `20` | ✗ |
| `toolbarOpen` | `boolean` | Whether the toolbar is currently open | `false` | ✗ |
| `layoutDropdownOpen` | `boolean` | Whether the layout dropdown is currently open | `false` | ✗ |
| `showAddButton` | `boolean` | Whether the add button in the top right should be shown | `true` | ✗ |
| `showLayoutDropdown` | `boolean` | Whether the layout dropdown should be shown | `true` | ✗ |
| `groupTemplateId` | `string` | The id of the currently selected grouping template ("two-column", "hero-sidebar", "card-grid" or "centered-stack") | `"two-column"` | ✗ |
| `infoForType` | `string \| null` | Which element type to show the info popup for | `null` | ✗ |
| `infoAnchorEl` | `HTMLElement \| null` | The DOM element the info popup is anchored to | `null` | ✗ |
| `suppressNextClick` | `boolean` | Prevents double trigger clicking issues | `false` | ✗ |
| `visibleLayoutModes` | `Record<LayoutMode, boolean>` | Which layout modes to show | `{ freeform: true, flow: true, flex: true, grid: true, }` | ✗ |
| `visibleCodeTabs` | `Record<CodeTab, boolean>` | Which code tabs to show in fullscreen mode | `{ combined: true, html: true, css: true, }` | ✗ |
| `showComponentSettingsInStudent` | `boolean` | Whether component settings should be shown in student mode | `true` | ✗ |
| `showSidebarInStudent` | `boolean` | Whether the sidebar (containing canvas settings) should be shown in student mode | `false` | ✗ |
| `showToolbarInStudent` | `boolean` | Whether the toolbar (to add more elements) should be shown in student mode | `true` | ✗ |
| `allowDeleteInStudent` | `boolean` | Whether elements should be deletable in student mode | `false` | ✗ |
| `allComponentsDialogOpen` | `boolean` | Whether the components dialog is currently open | `false` | ✗ |
| `allComponentsQuery` | `string` | The current components dialog search query | `""` | ✗ |
| `iconDialogOpen` | `boolean` | Whether the icon dialog is currently open | `false` | ✗ |
| `iconDraftName` | `string` | The currently selected icon's name | `"gear"` | ✗ |
| `iconDraftColor` | `string` | The selected color for the icon | `"#0f172a"` | ✗ |
| `iconQuery` | `string` | The icon dialog search query | `""` | ✗ |
| `iconScrollTop` | `number` | How much pixels the icon scroller is currently scrolled down (scrollTop) | `0` | ✗ |
| `iconViewportH` | `number` | The clientHeight of the icon scroller | `520` | ✗ |
| `iconScroller` | `HTMLElement \| null` | The icon scroller HTML element (#ww-icon-scroller) | `null` | ✗ |
| `_hasFocus` | `boolean` | Whether keyboard focus is currently inside this widget | `false` | ✗ |
| `iconDialogTarget` | `EventTarget \| null` | The element to dispatch icon result events from | `null` | ✗ |
| `activeNodes` | `BuilderNode[]` | The website element nodes depending on the current layout mode | - | ✗ |
| `onIconDialogAfterShow` | - | Executed after the icon dialog is opened | - | ✗ |
| `onIconDialogAfterHide` | - | Executed after the icon dialog is closed | - | ✗ |
| `isFullscreen` | - | Whether the widget is in fullscreen mode | - | ✗ |

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
*Generated with @webwriter/build@1.9.0*