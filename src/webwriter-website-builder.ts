import { html } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
// @ts-ignore
import LOCALIZE from "../localization/generated";
import { wbGear } from "./assets/icons";
import { shoelaceScoped } from "./assets/shoelaceImports";

import { builderStyles } from "./builder/styles/index";
import { BuilderExporter } from "./builder/exporter";
import { parseBuilderState, serializeBuilderState } from "./builder/state-io";
import {
  normalizeOrder,
  updateNodeById,
  deleteNodeById,
  findNodeById,
} from "./builder/layout";
import { groupNodes, ungroupNodes } from "./builder/layout";
import {
  getContainerTemplates,
  defaultFlexSettings,
  defaultGridSettings,
} from "./builder/types";
import type {
  BuilderNode,
  FlexSettings,
  GridSettings,
  LayoutMode,
  CodeTab,
} from "./builder/types";

// Controllers
import { DragController } from "./builder/controllers/drag-controller";
import { SelectionController } from "./builder/controllers/selection-controller";
import { KeyboardController } from "./builder/controllers/keyboard-controller";
import { LayoutController } from "./builder/controllers/layout-controller";

import { renderCanvasInner } from "./builder/render/canvas";
import {
  renderFloatingToolbar,
  renderInfoPopup,
} from "./builder/render/toolbar";
import {
  renderLayersPanel,
  renderVisibilitySettings,
  renderLayoutSettings,
  renderSelectedComponentSettings,
} from "./builder/render/sidebar";
import {
  renderIconDialog,
  renderAllComponentsDialog,
} from "./builder/render/dialogs";

import { WwIconPicker } from "./builder/components/ui/icon-picker";
import { ComponentRegistry } from "./components/registry";
import type { ComponentBinding } from "./types/BuilderComponent";

@customElement("webwriter-website-builder")
export class WebwriterWebsiteBuilder extends LitElementWw {
  // ─── i18n ────────────────────────────────────────────────────────────────
  protected localize = LOCALIZE;

  // ─── Controllers ─────────────────────────────────────────────────────────
  /** Handles all drag-and-drop logic */
  drag = new DragController(this);
  /** Handles node selection, multi-select, drill-in (double-click), and canvas click */
  selection = new SelectionController(this);
  /** Handles all keyboard shortcuts */
  keyboard = new KeyboardController(this);
  /** Handles layout mode switching and global flex/grid settings */
  layout = new LayoutController(this);

  // ─── State persistence ───────────────────────────────────────────────────
  /** Saves the widget data in an attribute */
  @property({ attribute: "ww-state" })
  accessor wwState: string = "";

  private _hydrating = false;
  private _lastSerialized = "";
  private _skipNextApplyFromWwState = false;

  // ─── Layout ──────────────────────────────────────────────────────────────
  /** The selected layout mode (freeform, flow, flex or grid) */
  layoutMode: LayoutMode = "freeform";
  /** The website element nodes for freeform layout */
  freeformNodes: BuilderNode[] = [];
  /** The ordered website element nodes for flow, flex or grid layout */
  orderedNodes: BuilderNode[] = [];
  /** Configuration of the flex layout */
  flexSettings: FlexSettings = defaultFlexSettings();
  /** Configuration of the grid layout */
  gridSettings: GridSettings = defaultGridSettings();

  /** Background color of the canvas, as an RGB hex code */
  canvasBackground: string = "#ffffff";

  // ─── Selection ───────────────────────────────────────────────────────────
  /** The id of the selected node */
  selectedNodeId: string | null = null;
  /** The selected HTML element */
  selectedElement: HTMLElement | null = null;
  /** Set of all selected node ids */
  @state() selectedIds: Set<string> = new Set();
  /** The id of the focused container */
  @state() focusedContainerId: string | null = null;

  // ─── Interaction keys ────────────────────────────────────────────────────
  /** Whether shift is currently pressed */
  shiftPressed = false;
  /** Whether the interact key ("A") is currently pressed */
  interactKeyPressed = false;
  /** Whether the grid key ("G") is currently pressed */
  @state() gridKeyPressed = false;
  /** Whether the hide toolbar key ("T") is currently pressed */
  @state() toolbarKeyHidden = false;
  /** Whether the grid overlay should be shown all the time */
  @state() showGrid = false;
  /** The size of the overlay grid */
  gridSize = 20;

  // ─── Toolbar / palette UI state ──────────────────────────────────────────
  /** Whether the toolbar is currently open */
  @state() toolbarOpen = false;
  /** Whether the layout dropdown is currently open */
  @state() layoutDropdownOpen = false;
  /** Whether the add button in the top right should be shown */
  showAddButton = true;
  /** Whether the layout dropdown should be shown */
  showLayoutDropdown = true;
  /** The id of the currently selected grouping template ("two-column", "hero-sidebar", "card-grid" or "centered-stack") */
  groupTemplateId = "two-column";

  // Palette state: tray, info popup, search, suppress-click guard, favourites
  /** @internal Never gets set? Can probably be removed */
  trayOpen = false;
  /** Which element type to show the info popup for */
  infoForType: string | null = null;
  /** The DOM element the info popup is anchored to */
  infoAnchorEl: HTMLElement | null = null;
  /** Prevents double trigger clicking issues */
  suppressNextClick = false;
  /** @internal Also never gets set. Can probably also be removed */
  private componentQuery = "";

  // ─── Author visibility toggles ───────────────────────────────────────────
  /** Which layout modes to show */
  @state() visibleLayoutModes: Record<LayoutMode, boolean> = {
    freeform: true,
    flow: true,
    flex: true,
    grid: true,
  };
  /** Which code tabs to show in fullscreen mode */
  @state() visibleCodeTabs: Record<CodeTab, boolean> = {
    combined: true,
    html: true,
    css: true,
  };

  // ─── Student mode toggles ────────────────────────────────────────────────
  /** Whether component settings should be shown in student mode */
  @state() showComponentSettingsInStudent = true;
  /** Whether the sidebar (containing canvas settings) should be shown in student mode */
  @state() showSidebarInStudent = false;
  /** Whether the toolbar (to add more elements) should be shown in student mode */
  @state() showToolbarInStudent = true;
  /** Whether elements should be deletable in student mode */
  @state() allowDeleteInStudent = false;

  // ─── All-components dialog ───────────────────────────────────────────────
  /** Whether the components dialog is currently open */
  @state() allComponentsDialogOpen = false;
  /** The current components dialog search query */
  @state() allComponentsQuery = "";

  // ─── Student drawer ───────────────────────────────────────────────────────
  @state() private _studentDrawerOpen = false;

  // ─── Code panel ──────────────────────────────────────────────────────────
  private _codeTab: CodeTab = "html";

  // ─── Icon dialog ─────────────────────────────────────────────────────────
  /** Whether the icon dialog is currently open */
  @state() iconDialogOpen = false;
  /** The currently selected icon's name */
  @state() iconDraftName = "gear";
  /** The selected color for the icon */
  @state() iconDraftColor = "#0f172a";
  /** The icon dialog search query */
  @state() iconQuery = "";
  /** How much pixels the icon scroller is currently scrolled down (scrollTop) */
  @state() iconScrollTop = 0;
  /** The clientHeight of the icon scroller */
  @state() iconViewportH = 520;
  /** The icon scroller HTML element (#ww-icon-scroller) */
  iconScroller: HTMLElement | null = null;
  /** Whether keyboard focus is currently inside this widget */
  _hasFocus = false;
  /** The element to dispatch icon result events from */
  iconDialogTarget: EventTarget | null = null;

  // ─── Exporter ────────────────────────────────────────────────────────────
  private exporter = new BuilderExporter();

  // ─── Scoped elements ─────────────────────────────────────────────────────
  /** @internal */
  static get scopedElements() {
    return { ...shoelaceScoped, "ww-icon-picker": WwIconPicker };
  }

  static styles = builderStyles;

  // ─── Public node accessors (used by controllers) ─────────────────────────

  /** The website element nodes depending on the current layout mode */
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
    this.selectedElement = this.renderRoot.querySelector(
      `[data-node-id="${id}"]`,
    ) as HTMLElement | null;
    this._maybeOpenStudentDrawerOnSelect();
    this.requestUpdate();
  }

  /** Clear the selection of nodes */
  clearSelection() {
    this.selectedNodeId = null;
    this.selectedElement = null;
    this.selectedIds = new Set();
    this._containerSettingsId = null; // must be reset on clear
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
  }

  /** Returns whether the focus is currently on an element that accepts typing text */
  isEditingWithinComponent(): boolean {
    const root = this.renderRoot as ShadowRoot;
    const ae =
      (root.activeElement as HTMLElement | null) ??
      (this.ownerDocument.activeElement as HTMLElement | null);
    if (!ae) return false;
    const inside =
      root.contains(ae) ||
      this.contains(ae) ||
      (ae as any).getRootNode?.() === root;
    if (!inside) return false;
    if (ae.matches('input, textarea, select, [contenteditable="true"]'))
      return true;
    if (ae.closest("sl-input, sl-textarea, sl-select")) return true;
    return false;
  }

  /** Returns whether the event target is an "interactive" element, that requires clicking for interaction */
  isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        [
          "a",
          "button",
          "input",
          "textarea",
          "select",
          "[contenteditable='true']",
          "audio",
          "video",
          "summary",
          "details",
          "sl-input",
          "sl-textarea",
          "sl-select",
          "sl-button",
          "sl-icon-button",
          "sl-checkbox",
          "sl-switch",
          "sl-radio",
          "sl-range",
        ].join(", "),
      ),
    );
  }

  // Container settings tracking (set when grouping, cleared on deselect)
  private _containerSettingsId: string | null = null;

  /** Returns whether the interact key is pressed */
  allowInteractEvent(_e: any): boolean {
    return this.interactKeyPressed;
  }

  /**
   * Allows interaction when ctrl/meta is held during a click.
   * DIFFERENT from allowInteractEvent — this uses ctrlKey/metaKey, not interactKeyPressed.
   * Used in selectNodeFromWrapper to allow link/button clicks through.
   */
  private _allowInteract(e: MouseEvent): boolean {
    return e.ctrlKey || e.metaKey;
  }

  /**
   * Select node from a wrapper click. Prevents link navigation unless ctrl/meta held.
   * Uses _allowInteract (ctrl/meta key), NOT allowInteractEvent (A key).
   */
  selectNodeFromWrapper(e: MouseEvent, id: string) {
    e.stopPropagation();
    if (this.isInteractiveTarget(e.target) && this._allowInteract(e)) return;
    this.blurActive();
    if (this.isInteractiveTarget(e.target) && !this._allowInteract(e)) {
      e.preventDefault();
    }
    this.selectNodeId(id);
  }

  /** Whether the widget is currently in author mode (contenteditable) */
  isAuthorMode() {
    return !!this.isContentEditable;
  }
  /** Whether the widget is currently in student mode */
  isStudentMode() {
    return !this.isContentEditable;
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

  // ─── Palette helpers ─────────────────────────────────────────────────────

  /** Returns sorted, filtered list of component type IDs for the palette */
  getPaletteItems(): string[] {
    const q = this.componentQuery.trim().toLowerCase();
    const allTypes = Object.keys(ComponentRegistry);
    const searched = q
      ? allTypes.filter((t) => {
          const label = (ComponentRegistry[t]?.label() ?? t).toLowerCase();
          return t.toLowerCase().includes(q) || label.includes(q);
        })
      : allTypes;
    return searched.sort((a, b) => {
      const la = (ComponentRegistry[a]?.label() ?? a).toLowerCase();
      const lb = (ComponentRegistry[b]?.label() ?? b).toLowerCase();
      return la.localeCompare(lb);
    });
  }

  // ─── Palette / quick add ─────────────────────────────────────────────────

  /** Quickly add a node by type via the elements palette */
  quickAdd(type: string) {
    const component = ComponentRegistry[type];
    if (!component) return;

    if (this.layoutMode === "freeform") {
      const node: BuilderNode = {
        id: crypto.randomUUID(),
        type,
        data: structuredClone(component.defaultData ?? {}),
        pos: { x: 32, y: 32 },
        order: this.activeNodes.length,
        display: "block",
      };
      this.setActiveNodes([...this.activeNodes, node]);
      this.selectNodeId(node.id);
      return;
    }

    const node: BuilderNode = {
      id: crypto.randomUUID(),
      type,
      data: structuredClone(component.defaultData ?? {}),
      order: this.activeNodes.length,
      display: "block",
    };
    this.setActiveNodes([...this.activeNodes, node]);
    this.normalizeOrder();
    this.selectNodeId(node.id);
  }

  // ─── Grouping ─────────────────────────────────────────────────────────────

  /** Group the selected nodes */
  groupSelected() {
    if (this.selectedIds.size < 2) return;
    const CONTAINER_TEMPLATES = getContainerTemplates();
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
    this._containerSettingsId = containerId; // must be set after grouping
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
      (
        this.renderRoot.querySelector("#ww-all-components-dialog") as any
      )?.show?.();
    });
  }

  // ─── Icon dialog handlers ─────────────────────────────────────────────────

  /** Executed after the icon dialog is opened */
  onIconDialogAfterShow = (e: Event) => {
    const dlg = e.target as HTMLElement;
    this.iconScroller = dlg.querySelector("#ww-icon-scroller");
    if (!this.iconScroller) return;
    this.iconScrollTop = this.iconScroller.scrollTop;
    this.iconViewportH = this.iconScroller.clientHeight;
    this.iconScroller.addEventListener("scroll", this._onIconDialogScroll, {
      passive: true,
    });
    queueMicrotask(() =>
      (dlg.querySelector("#ww-icon-search") as any)?.focus?.(),
    );
  };

  /** Executed after the icon dialog is closed */
  onIconDialogAfterHide = () => {
    this.iconScroller?.removeEventListener("scroll", this._onIconDialogScroll);
    this.iconScroller = null;
    this.iconDialogTarget = null;
    this.iconDialogOpen = false;
  };

  private _onIconDialogScroll = () => {
    if (!this.iconScroller) return;
    this.iconScrollTop = this.iconScroller.scrollTop;
    this.iconViewportH = this.iconScroller.clientHeight;
    this.requestUpdate();
  };

  // ─── Fullscreen ──────────────────────────────────────────────────────────

  /** Whether the widget is in fullscreen mode */
  get isFullscreen() {
    return this.ownerDocument.fullscreenElement === this;
  }

  private _onFsChange = () => {
    console.warn("[fs] change", {
      fsEl: document.fullscreenElement?.tagName ?? null,
      isFs: document.fullscreenElement === this,
    });
    this.requestUpdate();
  };
  private _onFsError = (e: Event) => console.warn("[fs] error", e);

  private async _toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await this.requestFullscreen();
    } finally {
      this.requestUpdate();
    }
  }

  // ─── Canvas reset ────────────────────────────────────────────────────────

  private async _confirmReset() {
    const confirmed = confirm(
      msg("This will remove all elements from the canvas. Continue?"),
    );
    if (confirmed) this._resetCanvas();
  }

  // Separate method — matches original structure exactly
  private _resetCanvas() {
    this.setActiveNodes([]);
    this.clearSelection();
    this.requestUpdate();
  }

  // ─── Private student drawer ───────────────────────────────────────────────

  private _closeStudentDrawer() {
    this._studentDrawerOpen = false;
    this.requestUpdate();
  }

  private _maybeOpenStudentDrawerOnSelect() {
    if (this.isStudentMode() && this.showComponentSettingsInStudent) {
      this._studentDrawerOpen = true;
    }
  }

  // ─── State serialisation ─────────────────────────────────────────────────

  private _serializeState(): string {
    return serializeBuilderState({
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
    });
  }

  private _applyState(serialized: string) {
    const parsed = parseBuilderState(serialized);
    if (!parsed) return;

    this.layoutMode = parsed.layoutMode;
    this.visibleLayoutModes =
      parsed.visibleLayoutModes ?? this.visibleLayoutModes;
    this.visibleCodeTabs = parsed.visibleCodeTabs ?? this.visibleCodeTabs;
    this.showComponentSettingsInStudent =
      parsed.showComponentSettingsInStudent ??
      this.showComponentSettingsInStudent;
    this.showSidebarInStudent =
      parsed.showSidebarInStudent ?? this.showSidebarInStudent;
    this.allowDeleteInStudent =
      parsed.allowDeleteInStudent ?? this.allowDeleteInStudent;
    this.showAddButton = parsed.showAddButton ?? this.showAddButton;
    this.showLayoutDropdown =
      parsed.showLayoutDropdown ?? this.showLayoutDropdown;
    this.showToolbarInStudent =
      parsed.showToolbarInStudent ?? this.showToolbarInStudent;
    this.freeformNodes = parsed.freeformNodes ?? [];
    this.orderedNodes = parsed.orderedNodes ?? parsed.nodes ?? [];
    this.showGrid = parsed.showGrid;
    this.gridSize = parsed.gridSize;
    this.flexSettings = parsed.flexSettings;
    this.gridSettings = parsed.gridSettings;
    this.canvasBackground = parsed.canvasBackground ?? "#ffffff";
    this.clearSelection();
  }

  // ─── Code export ──────────────────────────────────────────────────────────

  private _generateExport() {
    return this.exporter.generateExport({
      layoutMode: this.layoutMode,
      nodes: this.activeNodes,
      flexSettings: this.flexSettings,
      gridSettings: this.gridSettings,
    });
  }

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("ww-icon-picker-open", (e: any) => {
      e.stopPropagation();
      const picker = e
        .composedPath()
        .find((n: any) => n?.tagName?.toLowerCase?.() === "ww-icon-picker") as
        | HTMLElement
        | undefined;

      this.iconDialogTarget = picker ?? e.target;
      this.iconDraftName = e.detail?.name ?? "gear";
      this.iconDraftColor = e.detail?.color ?? "#0f172a";
      this.iconQuery = "";
      this.iconDialogOpen = true;

      this.updateComplete.then(() => {
        (this.renderRoot.querySelector("#ww-icon-dialog") as any)?.show?.();
      });
    });

    document.addEventListener("fullscreenchange", this._onFsChange);
    document.addEventListener("fullscreenerror", this._onFsError);
    window.addEventListener("mousedown", this._onGlobalMouseDown);
    window.addEventListener("keydown", this.keyboard.onKeyDown);
    window.addEventListener("keyup", this.keyboard.onKeyUp);

    this._hydrating = true;
    this._applyState(this.getAttribute("ww-state") || "");
    this._hydrating = false;
  }

  updated(changed: Map<string, unknown>) {
    super.updated(changed);

    if (changed.has("wwState")) {
      if (this._skipNextApplyFromWwState) {
        this._skipNextApplyFromWwState = false;
      } else if (!this._hydrating) {
        this._hydrating = true;
        this._applyState(this.wwState);
        this._hydrating = false;
      }
    }

    if (!this._hydrating) {
      const next = this._serializeState();
      if (next !== this._lastSerialized) {
        this._lastSerialized = next;
        this._skipNextApplyFromWwState = true;
        this.setAttribute("ww-state", next);
        this.wwState = next;
      }
    }
  }

  disconnectedCallback() {
    this.drag.cancelPendingFreeformDrag();
    this.drag.cancelPendingOrderedDrag();
    document.removeEventListener("fullscreenchange", this._onFsChange);
    document.removeEventListener("fullscreenerror", this._onFsError);
    window.removeEventListener("mousedown", this._onGlobalMouseDown);
    window.removeEventListener("keydown", this.keyboard.onKeyDown);
    window.removeEventListener("keyup", this.keyboard.onKeyUp);
    super.disconnectedCallback();
  }

  private _onGlobalMouseDown = (e: MouseEvent) => {
    const path = e.composedPath();
    this._hasFocus = path.includes(this);
    if (!path.includes(this)) return;

    const palette = this.shadowRoot?.querySelector(".palette");
    const clickedInsidePalette = palette ? path.includes(palette) : false;

    // Original checks trayOpen || infoForType (palette popup state), not toolbarOpen
    if (!clickedInsidePalette && (this.trayOpen || this.infoForType)) {
      this.trayOpen = false;
      this.infoForType = null;
      this.infoAnchorEl = null;
      this.requestUpdate();
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  render() {
    const showGridOverlay = this.showGrid || this.gridKeyPressed;
    const split = this.isFullscreen;
    const isAuthor = this.isContentEditable;
    const isStudent = !isAuthor;

    const canShowStudentDrawer =
      isStudent && this.showComponentSettingsInStudent;
    const hasSelection = Boolean(this.selectedNodeId);
    const showDrawer =
      canShowStudentDrawer && hasSelection && this._studentDrawerOpen;

    const { html: outHtml, css: outCss, combined } = this._generateExport();
    const hideSidebar = split || (isStudent && !this.showSidebarInStudent);

    return html`
      <div class="layout ${split ? "fullscreen-split" : ""}" tabindex="-1">
        <!-- Sidebar -->
        <div part="options" style=${hideSidebar ? "display:none;" : ""}>
          <div class="settings">
            <h2>${wbGear} ${msg("Settings")}</h2>

            <sl-details summary=${msg("Canvas")}>
              ${renderLayersPanel(this)}

              <div class="settings-row">
                <sl-button
                  size="small"
                  variant="default"
                  @click=${this._confirmReset}
                  style="margin-left:auto;"
                >
                  ${msg("Reset Canvas")}
                </sl-button>
              </div>

              <div
                style="margin-top:0.5rem;font-size:0.78rem;color:var(--sl-color-neutral-600);
                          padding:0.4rem 0.6rem;background:var(--sl-color-neutral-50);
                          border-radius:8px;border:1px solid var(--sl-color-neutral-200);"
              >
                ${msg(html`Hold <kbd>T</kbd> to temporarily hide the toolbar overlay.`)}
              </div>
            </sl-details>

            ${renderVisibilitySettings(this)} ${renderLayoutSettings(this)}
            ${renderSelectedComponentSettings(this)}
          </div>
        </div>

        <!-- Editor / Canvas -->
        <div class="editor" style=${split ? "height:100%;" : ""}>
          <div
            class="canvas ${this.activeNodes.length > 0 ? "has-nodes" : ""}"
            @dragover=${this.drag.onDragOver.bind(this.drag)}
            @drop=${this.drag.onDrop.bind(this.drag)}
            style="--grid-size:${this.gridSize}px; background:${this
              .canvasBackground};"
            @click=${(e: MouseEvent) => this.selection.onCanvasClick(e)}
          >
            ${showGridOverlay ? html`<div class="grid-overlay"></div>` : null}
            ${renderCanvasInner(this)} ${renderFloatingToolbar(this)}
            ${renderInfoPopup(this)}

            <div class="fs-btn" style=${this.toolbarKeyHidden ? "display:none;" : ""}>
              <sl-button
                size="small"
                variant="primary"
                @click=${this._toggleFullscreen}
              >
                <sl-icon
                  name=${this.isFullscreen ? "fullscreen-exit" : "fullscreen"}
                ></sl-icon>
              </sl-button>
            </div>
          </div>
        </div>

        <!-- Code panel (fullscreen only) -->
        ${split
          ? html`
              <div class="code-panel" aria-label=${msg("Code")}>
                <div class="code-header">
                  <div class="code-title">${msg("Code")}</div>
                  <div class="code-tabs" role="tablist" aria-label=${msg("Code tabs")}>
                    ${this._renderCodeTabs()}
                  </div>
                </div>
                <pre class="code-body" tabindex="0">
                  ${this._codeTab === "combined"
                    ? combined
                    : this._codeTab === "html"
                      ? outHtml
                      : outCss}
                </pre
                >
              </div>
            `
          : null}

        <!-- Student settings drawer -->
        ${showDrawer
          ? html`
              <sl-drawer
                label=${msg("Component settings")}
                placement="end"
                contained
                .open=${true}
                @sl-after-hide=${this._closeStudentDrawer}
                @sl-request-close=${(e: CustomEvent) => {
                  e.preventDefault();
                  this._closeStudentDrawer();
                }}
              >
                <div class="settings">
                  ${renderSelectedComponentSettings(this, { bare: true })}
                </div>
              </sl-drawer>
            `
          : null}
        ${renderIconDialog(this)} ${renderAllComponentsDialog(this)}
      </div>
    `;
  }

  private _renderCodeTabs() {
    const tabs: Array<[CodeTab, string]> = [
      ["combined", msg("Combined")],
      ["html", "HTML"],
      ["css", "CSS"],
    ];
    return tabs
      .filter(([t]) => this.visibleCodeTabs[t])
      .map(
        ([t, label]) => html`
          <button
            class="code-tab ${this._codeTab === t ? "active" : ""}"
            @click=${() => {
              this._codeTab = t;
              this.requestUpdate();
            }}
            type="button"
            role="tab"
            aria-selected=${this._codeTab === t ? "true" : "false"}
          >
            ${label}
          </button>
        `,
      );
  }
}
