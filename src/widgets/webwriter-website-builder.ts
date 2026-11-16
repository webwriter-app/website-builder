import { sourceLocale, targetLocales } from "../../localization/generated/locale-codes.js";
import { LitElementWw } from "@webwriter/lit";
import { jsonData } from "@webwriter/lit/data";
import { localizer } from "@webwriter/lit/localize";
import { Permissions } from "@webwriter/lit/permissions";
import { Shortcuts } from "@webwriter/lit/shortcuts";
import { customElement, state } from "lit/decorators.js";
import { shoelaceScoped } from "../components/shoelace-imports";

import { builderStyles } from "../components/builder/builder.styles";
import { BuilderExporter } from "../model/exporter";
import {
  mergeParsedState,
  parseBuilderState,
  serializeBuilderState,
  type BuilderStateFields,
} from "../model/state-io";
import {
  normalizeOrder,
  updateNodeById,
  deleteNodeById,
  findNodeById,
} from "../model/layout";
import { groupNodes, ungroupNodes } from "../model/layout";
import {
  getContainerTemplates,
  defaultFlexSettings,
  defaultGridSettings,
} from "../model/types";
import type { MsgFn } from "@lit/localize";
import type SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import type {
  BuilderNode,
  FlexSettings,
  GridSettings,
  LayoutMode,
  CodeTab,
} from "../model/types";

// Controllers
import { DragController } from "../components/builder/drag-controller";
import { SelectionController } from "../components/builder/selection-controller";
import { KeyboardController } from "../components/builder/keyboard-controller";
import { LayoutController } from "../components/builder/layout-controller";

import { renderBuilder } from "../components/builder/render-widget";
import { isEditingWithin, isInteractive } from "../components/builder/dom-queries";
import { IconDialogHandlers } from "../components/builder/icon-dialog-handlers";

import { WwIconPicker } from "../components/builder/icon-picker";

/**
 * Build, explore and understand static websites with different layouts (Freeform, Flow, Flex, Grid).
 *
 * To add a component that authors can place on the canvas, add a file implementing
 * `BuilderComponent` under `src/components/` and register it under its type name
 * (for example "h1") in `src/components/registry.ts`. The type is what the document
 * stores for a placed node.
 */
@customElement("webwriter-website-builder")
export class WebwriterWebsiteBuilder extends LitElementWw {
  static styles = builderStyles;

  static scopedElements = { ...shoelaceScoped, "ww-icon-picker": WwIconPicker };

  static actions = {
    configureBuilder: { label: (widget: { msg: MsgFn }) => widget.msg("Builder settings") },
    // Keys of the canvas: hidden, they only run from the keyboard.
    cancel: { shortcut: "Escape", hidden: true },
    removeSelected: { shortcut: ["Delete", "Backspace"], hidden: true },
    nudgeUp: { shortcut: "ArrowUp", hidden: true },
    nudgeDown: { shortcut: "ArrowDown", hidden: true },
    nudgeLeft: { shortcut: "ArrowLeft", hidden: true },
    nudgeRight: { shortcut: "ArrowRight", hidden: true },
  };

  localize = localizer(this, {
    sourceLocale,
    targetLocales,
    load: (locale) => import(`../../localization/generated/${locale}.ts`),
    drawer: true,
  });
  public readonly msg = this.localize.msg;

  #permissions = new Permissions(this);
  #shortcuts = new Shortcuts(this);

  /** @internal Handles all drag-and-drop logic */
  drag = new DragController(this);
  /** @internal Handles node selection, multi-select, drill-in (double-click), and canvas click */
  selection = new SelectionController(this);
  /** Handles the keys that are held down: grid, toolbar, interact and shift */
  private keyboard = new KeyboardController(this);
  /** @internal Handles layout mode switching and global flex/grid settings */
  layout = new LayoutController(this);
  private exporter = new BuilderExporter();
  /** @internal Handles opening, scrolling and closing of the icon dialog */
  iconDialog = new IconDialogHandlers(this);

  // ─── Layout ──────────────────────────────────────────────────────────────
  /** @internal The selected layout mode (freeform, flow, flex or grid) */
  layoutMode: LayoutMode = "freeform";
  /** @internal The website element nodes for freeform layout */
  freeformNodes: BuilderNode[] = [];
  /** @internal The ordered website element nodes for flow, flex or grid layout */
  orderedNodes: BuilderNode[] = [];
  /** @internal Configuration of the flex layout */
  flexSettings: FlexSettings = defaultFlexSettings();
  /** @internal Configuration of the grid layout */
  gridSettings: GridSettings = defaultGridSettings();

  /** @internal Background color of the canvas, as an RGB hex code */
  canvasBackground: string = "#ffffff";

  // ─── Selection ───────────────────────────────────────────────────────────
  /** @internal The id of the selected node */
  selectedNodeId: string | null = null;
  /** @internal Set of all selected node ids */
  @state() accessor selectedIds: Set<string> = new Set();
  /** @internal The id of the focused container */
  @state() accessor focusedContainerId: string | null = null;

  // ─── Interaction keys ────────────────────────────────────────────────────
  /** @internal Whether shift is currently pressed */
  shiftPressed = false;
  /** @internal Whether the interact key ("A") is currently pressed */
  interactKeyPressed = false;
  /** @internal Whether the grid key ("G") is currently pressed */
  @state() accessor gridKeyPressed = false;
  /** @internal Whether the hide toolbar key ("T") is currently pressed */
  @state() accessor toolbarKeyHidden = false;
  /** Whether the grid overlay should be shown all the time */
  @state() accessor showGrid = false;
  /** @internal The size of the overlay grid */
  gridSize = 20;

  // ─── Toolbar / palette UI state ──────────────────────────────────────────
  /** @internal Whether the toolbar is currently open */
  @state() accessor toolbarOpen = false;
  /** @internal Whether the layout dropdown is currently open */
  @state() accessor layoutDropdownOpen = false;
  /** @internal Whether the add button in the top right should be shown */
  showAddButton = true;
  /** @internal Whether the layout dropdown should be shown */
  showLayoutDropdown = true;
  /** @internal The id of the currently selected grouping template ("two-column", "hero-sidebar", "card-grid" or "centered-stack") */
  groupTemplateId = "two-column";

  // Palette state: tray, info popup, search, suppress-click guard, favourites
  /** @internal Never gets set? Can probably be removed */
  trayOpen = false;
  /** @internal Which element type to show the info popup for */
  infoForType: string | null = null;
  /** @internal The DOM element the info popup is anchored to */
  infoAnchorEl: HTMLElement | null = null;
  /** @internal Prevents double trigger clicking issues */
  suppressNextClick = false;

  // ─── Author visibility toggles ───────────────────────────────────────────
  /** @internal Which layout modes to show */
  @state() accessor visibleLayoutModes: Record<LayoutMode, boolean> = {
    freeform: true,
    flow: true,
    flex: true,
    grid: true,
  };
  /** @internal Which code tabs to show in fullscreen mode */
  @state() accessor visibleCodeTabs: Record<CodeTab, boolean> = {
    combined: true,
    html: true,
    css: true,
  };

  // ─── Student mode toggles ────────────────────────────────────────────────
  /** @internal Whether component settings should be shown in student mode */
  @state() accessor showComponentSettingsInStudent = true;
  /** @internal Whether the sidebar (containing canvas settings) should be shown in student mode */
  @state() accessor showSidebarInStudent = false;
  /** @internal Whether the toolbar (to add more elements) should be shown in student mode */
  @state() accessor showToolbarInStudent = true;
  /** @internal Whether elements should be deletable in student mode */
  @state() accessor allowDeleteInStudent = false;

  // ─── All-components dialog ───────────────────────────────────────────────
  /** @internal Whether the components dialog is currently open */
  @state() accessor allComponentsDialogOpen = false;
  /** @internal The current components dialog search query */
  @state() accessor allComponentsQuery = "";

  // ─── Student drawer ───────────────────────────────────────────────────────
  @state() accessor _studentDrawerOpen = false;

  // ─── Code panel ──────────────────────────────────────────────────────────
  @state() accessor _codePanelOpen = false;
  _codeTab: CodeTab = "html";
  private _wasFullscreen = false;

  // ─── Icon dialog ─────────────────────────────────────────────────────────
  /** @internal Whether the icon dialog is currently open */
  @state() accessor iconDialogOpen = false;
  /** @internal The currently selected icon's name */
  @state() accessor iconDraftName = "gear";
  /** @internal The selected color for the icon */
  @state() accessor iconDraftColor = "#0f172a";
  /** @internal Names of the icons the dialog offers, loaded when it first opens */
  @state() accessor iconNames: string[] = [];
  /** @internal The icon dialog search query */
  @state() accessor iconQuery = "";
  /** @internal How much pixels the icon scroller is currently scrolled down (scrollTop) */
  @state() accessor iconScrollTop = 0;
  /** @internal The clientHeight of the icon scroller */
  @state() accessor iconViewportH = 520;
  /** @internal The icon scroller HTML element (#ww-icon-scroller) */
  iconScroller: HTMLElement | null = null;
  /** @internal The element to dispatch icon result events from */
  iconDialogTarget: EventTarget | null = null;

  // Declared after the state fields: the first read of the block applies it to them.
  private _defaultSerialized = this._serializeState();
  private _lastSerialized = this._defaultSerialized;
  #data = jsonData<Record<string, unknown>>(this, {
    defaults: {},
    changed: (value) => this._blockChanged(value),
  });

  #listeners?: AbortController;

  connectedCallback() {
    super.connectedCallback();
    this.#listeners = new AbortController();
    const { signal } = this.#listeners;

    this.addEventListener("ww-icon-picker-open", this.iconDialog.onPickerOpen, { signal });
    // Keys reach the widget only while the focus is inside it.
    this.addEventListener("keydown", this.keyboard.onKeyDown, { signal });
    this.addEventListener("keyup", this.keyboard.onKeyUp, { signal });
    this.addEventListener("focusout", this.keyboard.onFocusOut, { signal });
    this.addEventListener("mousedown", this._onMouseDown, { signal });
    window.addEventListener("blur", this.keyboard.onWindowBlur, { signal });
    this.ownerDocument.addEventListener("fullscreenchange", this._onFsChange, { signal });
  }

  updated(changed: Map<string, unknown>) {
    super.updated(changed);
    const next = this._serializeState();
    if (next !== this._lastSerialized) {
      this.#data.set(JSON.parse(next));
      this._lastSerialized = next;
    }
  }

  disconnectedCallback() {
    this.drag.dispose();
    this.#listeners?.abort();
    this.#listeners = undefined;
    super.disconnectedCallback();
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  configureBuilder() {
    const dialog = this.renderRoot.querySelector<HTMLDialogElement>("#builder-settings");
    if (dialog && !dialog.open) dialog.showModal();
  }

  /** Escape: leaves the focused container, otherwise clears the selection. */
  cancel() {
    if (this.focusedContainerId) {
      this.focusedContainerId = null;
    } else if (this.selectedNodeId || this.selectedIds.size) {
      this.clearSelection();
    } else {
      return false;
    }
  }

  /** Delete or Backspace: removes the selected node. */
  removeSelected() {
    if (!this.selectedNodeId) return false;
    if (this.isStudentMode() && !this.allowDeleteInStudent) return false;
    this.deleteSelectedNode();
  }

  nudgeUp() { return this._nudge(0, -1); }
  nudgeDown() { return this._nudge(0, 1); }
  nudgeLeft() { return this._nudge(-1, 0); }
  nudgeRight() { return this._nudge(1, 0); }

  /** Moves the selected node by one pixel in freeform layout. */
  private _nudge(dx: number, dy: number) {
    if (this.layoutMode !== "freeform") return false;
    const node = this.getSelectedNode();
    if (!node) return false;
    const { x, y } = node.pos ?? { x: 0, y: 0 };
    this.updateNode(node.id, { pos: { x: x + dx, y: y + dy } });
  }

  /** Reapplies the state of the data block when it changes from outside: load, remote change, undo. */
  private _blockChanged(value: object) {
    this._applyState(this._defaultSerialized);
    this._applyState(JSON.stringify(value));
    this._lastSerialized = this._serializeState();
    this.requestUpdate();
  }
  // ─── Public node accessors (used by controllers) ─────────────────────────

  /** @internal The website element nodes depending on the current layout mode */
  get activeNodes(): BuilderNode[] {
    return this.layoutMode === "freeform"
      ? this.freeformNodes
      : this.orderedNodes;
  }

  /** Set the freeform or ordered nodes array, depending on the current layout mode */
  setActiveNodes(next: BuilderNode[]) {
    if (this.layoutMode === "freeform") this.freeformNodes = next;
    else this.orderedNodes = next;
    this.requestUpdate();
  }

  /** Sets the order attribute of each node to its position in the array */
  normalizeOrder() {
    this.setActiveNodes(normalizeOrder(this.activeNodes));
  }

  // ─── Selection helpers (used by controllers) ─────────────────────────────

  /** Select a node based on its id */
  selectNodeId(id: string) {
    this.selectedNodeId = id;
    this._maybeOpenStudentDrawerOnSelect();
    this.requestUpdate();
  }

  /** Clear the selection of nodes */
  clearSelection() {
    this.selectedNodeId = null;
    this.selectedIds = new Set();
    this.focusedContainerId = null;
    if (this.isStudentMode()) this._studentDrawerOpen = false;
    this.requestUpdate();
  }

  /** Get the BuilderNode object of the selected node, if a node is selected */
  getSelectedNode(): BuilderNode | null {
    if (!this.selectedNodeId) return null;
    return findNodeById(this.activeNodes, this.selectedNodeId) ?? null;
  }

  /** Update the node with given id using a (partial) BuilderNode object */
  updateNode(id: string, patch: Partial<BuilderNode>) {
    this.setActiveNodes(updateNodeById(this.activeNodes, id, patch));
  }

  /** Delete the selected node */
  deleteSelectedNode() {
    const id = this.selectedNodeId;
    if (!id) return;
    const next = deleteNodeById(this.activeNodes, id);
    this.clearSelection();
    this.setActiveNodes(
      this.layoutMode !== "freeform" ? normalizeOrder(next) : next,
    );
  }

  /** Blur the active element */
  blurActive() {
    const root = this.renderRoot as ShadowRoot;
    (root.activeElement as HTMLElement | null)?.blur();
    const dae = this.ownerDocument.activeElement as HTMLElement | null;
    if (dae && dae !== this) dae.blur();
    // Keys reach the widget only while the focus is inside it.
    root.querySelector<HTMLElement>(".layout")?.focus({ preventScroll: true });
  }

  /** Returns whether the focus is currently on an element that accepts typing text */
  isEditingWithinComponent(): boolean {
    return isEditingWithin(this);
  }

  /** Returns whether the event target is an "interactive" element, that requires clicking for interaction */
  isInteractiveTarget(target: EventTarget | null): boolean {
    return isInteractive(target);
  }

  /** Returns whether the interact key is pressed */
  allowInteractEvent(_e: Event): boolean {
    return this.interactKeyPressed;
  }

  /** Whether the widget is currently in author mode (contenteditable) */
  isAuthorMode() {
    return this.#permissions.editing;
  }
  /** Whether the widget is currently in student mode */
  isStudentMode() {
    return !this.#permissions.editing;
  }

  // ─── Grid helpers (used by DragController) ───────────────────────────────

  /** Get grid placement from pointer position */
  gridPlacementFromPointer(
    root: HTMLElement,
    clientX: number,
    clientY: number,
  ) {
    return this.layout.gridPlacementFromPointer(root, clientX, clientY);
  }

  // ─── Grouping ─────────────────────────────────────────────────────────────

  /** Group the selected nodes */
  groupSelected() {
    if (this.selectedIds.size < 2) return;
    const CONTAINER_TEMPLATES = getContainerTemplates(this.msg);
    const template =
      CONTAINER_TEMPLATES.find((t) => t.id === this.groupTemplateId) ??
      CONTAINER_TEMPLATES[0];
    const { nodes: next, containerId } = groupNodes(
      this.activeNodes,
      [...this.selectedIds],
      {
        containerLayout: template.containerLayout,
        containerFlexSettings: template.containerFlexSettings,
        containerGridSettings: template.containerGridSettings,
      },
    );
    this.setActiveNodes(next);
    this.clearSelection();
    this.selectNodeId(containerId);
    this.requestUpdate();
  }

  /** Ungroups the selected group of nodes */
  ungroupContainer(containerId: string) {
    this.clearSelection();
    this.setActiveNodes(ungroupNodes(this.activeNodes, containerId));
    this.requestUpdate();
  }

  // ─── Code tab visibility ──────────────────────────────────────────────────

  /** Set visibility of the code tab */
  setCodeTabVisible(tab: CodeTab, visible: boolean) {
    const next = { ...this.visibleCodeTabs, [tab]: visible };
    if (!Object.values(next).some(Boolean)) return;
    this.visibleCodeTabs = next;
    if (!this.visibleCodeTabs[this._codeTab]) {
      const fallback = (Object.keys(this.visibleCodeTabs) as CodeTab[]).find(
        (t) => this.visibleCodeTabs[t],
      );
      if (fallback) this._codeTab = fallback;
    }
    this.requestUpdate();
  }

  // ─── All-components dialog ───────────────────────────────────────────────

  /** Open the all components dialog */
  openAllComponentsDialog() {
    this.allComponentsQuery = "";
    this.allComponentsDialogOpen = true;
    this.updateComplete.then(() => {
      this.renderRoot.querySelector<SlDialog>("#ww-all-components-dialog")?.show();
    });
  }

  // ─── Fullscreen ──────────────────────────────────────────────────────────

  /** Whether the widget is in fullscreen mode */
  get isFullscreen() {
    return this.ownerDocument.fullscreenElement === this;
  }

  async _toggleFullscreen() {
    const document = this.ownerDocument;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await this.requestFullscreen();
    } finally {
      this.requestUpdate();
    }
  }

  // ─── Canvas reset ────────────────────────────────────────────────────────

  async _confirmReset() {
    const confirmed = confirm(
      this.msg("This will remove all elements from the canvas. Continue?"),
    );
    if (confirmed) this._resetCanvas();
  }

  private _resetCanvas() {
    this.setActiveNodes([]);
    this.clearSelection();
    this.requestUpdate();
  }

  // ─── Private student drawer ───────────────────────────────────────────────

  _closeStudentDrawer() {
    this._studentDrawerOpen = false;
    this.requestUpdate();
  }

  private _maybeOpenStudentDrawerOnSelect() {
    if (this.isStudentMode() && this.showComponentSettingsInStudent) {
      this._studentDrawerOpen = true;
    }
  }

  // ─── State serialisation ─────────────────────────────────────────────────

  private _stateFields(): BuilderStateFields {
    return {
      visibleLayoutModes: this.visibleLayoutModes,
      visibleCodeTabs: this.visibleCodeTabs,
      showComponentSettingsInStudent: this.showComponentSettingsInStudent,
      layoutMode: this.layoutMode,
      freeformNodes: this.freeformNodes,
      orderedNodes: this.orderedNodes,
      showSidebarInStudent: this.showSidebarInStudent,
      allowDeleteInStudent: this.allowDeleteInStudent,
      showAddButton: this.showAddButton,
      showLayoutDropdown: this.showLayoutDropdown,
      showToolbarInStudent: this.showToolbarInStudent,
      showGrid: this.showGrid,
      gridSize: this.gridSize,
      flexSettings: this.flexSettings,
      gridSettings: this.gridSettings,
      canvasBackground: this.canvasBackground,
    };
  }

  private _serializeState(): string {
    return serializeBuilderState(this._stateFields());
  }

  private _applyState(serialized: string) {
    const parsed = parseBuilderState(serialized);
    if (!parsed) return;
    Object.assign(this, mergeParsedState(parsed, this._stateFields()));
    this.clearSelection();
  }

  // ─── Code export ──────────────────────────────────────────────────────────

  _generateExport() {
    return this.exporter.generateExport({
      layoutMode: this.layoutMode,
      nodes: this.activeNodes,
      flexSettings: this.flexSettings,
      gridSettings: this.gridSettings,
    });
  }

  private _onFsChange = () => {
    const isFullscreen = this.isFullscreen;
    if (
      this._wasFullscreen &&
      !isFullscreen
    ) {
      this._codePanelOpen = false;
    }
    this._wasFullscreen = isFullscreen;
    this.requestUpdate();
  };

  /** Closes the palette popup on a press outside the palette. */
  private _onMouseDown = (e: MouseEvent) => {
    const palette = this.shadowRoot?.querySelector(".palette");
    const clickedInsidePalette = palette ? e.composedPath().includes(palette) : false;

    if (!clickedInsidePalette && (this.trayOpen || this.infoForType)) {
      this.trayOpen = false;
      this.infoForType = null;
      this.infoAnchorEl = null;
      this.requestUpdate();
    }
  };

  _toggleCodePanel = () => {
    this._codePanelOpen = !this._codePanelOpen;
    this.requestUpdate();
  };

  _closeCodePanel = () => {
    const wasOpen = this._codePanelOpen;
    this._codePanelOpen = false;
    if (wasOpen) this.requestUpdate();
  };

  render() {
    return renderBuilder(this);
  }
}
