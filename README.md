# Website Builder (`@webwriter/website-builder@2.1.0`)
[License: MIT](LICENSE) | Version: 2.1.0

Build and explore static websites with different layouts.

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
Build, explore and understand static websites with different layouts (Freeform, Flow, Flex, Grid).

To add a component that authors can place on the canvas, add a file implementing
`BuilderComponent` under `src/components/` and register it under its type name
(for example "h1") in `src/components/registry.ts`. The type is what the document
stores for a placed node.

Keyboard: Tab reaches each placed element, Enter or Space selects it (Shift adds to the
selection) and Enter opens a selected container. Arrow keys nudge by one pixel in freeform
layout, Alt with an arrow key moves one place in flow, flex and grid layout, Delete removes,
Escape closes menus, leaves a container or clears the selection. Hold G for the grid, T to
hide the toolbar, A to use the elements. Touch devices get a bar for delete, grid and interact.

Theme: text follows `--ww-text-color` and `--ww-font-family`, accents `--ww-theme-accent-1`.
Print: controls are hidden, the canvas prints as it is, an empty canvas prints a short note.

Conversions: exports the page as a standalone HTML document (`text/html`) and the whole builder
state as `.json`, which imports again without loss. HTML cannot be imported, and uploaded media
without a public address is left out of the HTML. Signal `html`: the generated page markup.

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
| `WebwriterWebsiteBuilder.scopedElements` | `object` | - | `{ ...shoelaceScoped, "ww-icon-picker": WwIconPicker }` | ✗ |
| `WebwriterWebsiteBuilder.convertTo` | `object` | - | `{ "text/html": "exportHtml", ".json": "exportJson", }` | ✗ |
| `WebwriterWebsiteBuilder.convertFrom` | `object` | - | `{ ".json": "importJson", }` | ✗ |
| `WebwriterWebsiteBuilder.actions` | `object` | - | `{ configureBuilder: { label: (widget: { msg: MsgFn }) => widget.msg("Builder settings") }, // Keys of the canvas: hidden, they only run from the keyboard. cancel: { shortcut: "Escape", hidden: true }, removeSelected: { shortcut: ["Delete", "Backspace"], hidden: true }, nudgeUp: { shortcut: "ArrowUp", hidden: true }, nudgeDown: { shortcut: "ArrowDown", hidden: true }, nudgeLeft: { shortcut: "ArrowLeft", hidden: true }, nudgeRight: { shortcut: "ArrowRight", hidden: true }, moveEarlier: { shortcut: ["Alt+ArrowUp", "Alt+ArrowLeft"], hidden: true }, moveLater: { shortcut: ["Alt+ArrowDown", "Alt+ArrowRight"], hidden: true }, }` | ✗ |
| `localize` | - | - | - | ✗ |
| `msg` | - | - | - | ✗ |
| `showGrid` | `boolean` | Whether the grid overlay should be shown all the time | `false` | ✗ |
| `_studentDrawerOpen` | `boolean` | - | `false` | ✗ |
| `_codePanelOpen` | `boolean` | - | `false` | ✗ |
| `_codeTab` | `CodeTab` | - | `"html"` | ✗ |
| `signals` | `object` | The generated page markup, exported when read (empty while disconnected). | `{ html: computed(() => (this.#version.get(), this.#connected.get() ? this._generateExport().html : "")) }` | ✗ |
| `isFullscreen` | - | Whether the widget is in fullscreen mode | - | ✗ |
| `_toggleCodePanel` | - | - | - | ✗ |
| `_closeCodePanel` | - | - | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Methods
| Name | Description | Parameters |
| :--: | :---------: | :-------: |
| `configureBuilder` | - | -
| `cancel` | Escape: closes an open menu, leaves the focused container, otherwise clears the selection. | -
| `removeSelected` | Delete or Backspace: removes the selected node. | -
| `nudgeUp` | - | -
| `nudgeDown` | - | -
| `nudgeLeft` | - | -
| `nudgeRight` | - | -
| `moveEarlier` | - | -
| `moveLater` | - | -
| `exportHtml` | Exports the built page as a standalone HTML document. | -
| `exportJson` | Exports the whole builder state; `importJson` reads it back. | -
| `importJson` | Reads a builder state file; the widget changes only when the returned function runs. | `file: File`
| `setActiveNodes` | Set the freeform or ordered nodes array, depending on the current layout mode | `next: BuilderNode[]`
| `normalizeOrder` | Sets the order attribute of each node to its position in the array | -
| `selectNodeId` | Select a node based on its id | `id: string`
| `clearSelection` | Clear the selection of nodes | -
| `getSelectedNode` | Get the BuilderNode object of the selected node, if a node is selected | -
| `updateNode` | Update the node with given id using a (partial) BuilderNode object | `id: string`, `patch: Partial<BuilderNode>`
| `deleteSelectedNode` | Delete the selected node | -
| `focus` | Moves the focus to the first placed element, or to the add button on an empty canvas. | `options: FocusOptions`
| `blurActive` | Blur the active element | -
| `isEditingWithinComponent` | Returns whether the focus is currently on an element that accepts typing text | -
| `isInteractiveTarget` | Returns whether the event target is an "interactive" element, that requires clicking for interaction | `target: EventTarget | null`
| `allowInteractEvent` | Returns whether the interact key is pressed | -
| `isAuthorMode` | Whether the widget is currently in author mode (contenteditable) | -
| `isStudentMode` | Whether the widget is currently in student mode | -
| `gridPlacementFromPointer` | Get grid placement from pointer position | `root: HTMLElement`, `clientX: number`, `clientY: number`
| `setCodeTabVisible` | Set visibility of the code tab | `tab: CodeTab`, `visible: boolean`
| `openAllComponentsDialog` | Open the all components dialog | -
| `_toggleFullscreen` | - | -
| `_confirmReset` | - | -
| `_closeStudentDrawer` | - | -
| `_generateExport` | - | -

*[Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions) allow programmatic access to the widget.*

## CSS parts
| Name | Description |
| :--: | :---------: |
| canvas | The area the page is built on. |
| code | The panel with the generated HTML and CSS. |

*[CSS parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) allow freely styling internals of the widget with CSS.*

## Editing config
| Name | Value |
| :--: | :---------: |


*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public slots, events, or custom CSS properties.*


---
*Generated with @webwriter/build@1.15.0*
