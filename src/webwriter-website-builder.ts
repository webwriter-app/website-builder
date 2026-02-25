import { html } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import LOCALIZE from "../localization/generated";
import { msg } from "@lit/localize";
import { wbGear } from "./assets/icons";
import { ComponentRegistry } from "./components/registry";
import type { ComponentBinding } from "./types/BuilderComponent";
import { shoelaceScoped } from "./assets/shoelaceImports";

import { BuilderExporter } from "./builder/exporter";
import {
  normalizeOrder,
  sortedNodes,
  convertFreeformToOrdered,
  convertOrderedToFreeform,
} from "./builder/layout";
import { componentSyntaxHint, tileGlyph } from "./builder/palette-helpers";
import { parseBuilderState, serializeBuilderState } from "./builder/state-io";
import { builderStyles } from "./builder/styles";
import type {
  BuilderNode,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "./builder/types";
import { defaultFlexSettings, defaultGridSettings } from "./builder/types";

@customElement("webwriter-website-builder")
export class WebwriterWebsiteBuilder extends LitElementWw {
  // translation
  localize = LOCALIZE;
  msg = msg;

  // reactive propert that is used for state persistence. If this variable changes it re-renders the component
  @property({ attribute: "ww-state" })
  accessor wwState: string = "";

  // internal guard to avoid loops
  private _hydrating = false;
  private _lastSerialized = "";
  private _skipNextApplyFromWwState = false;

  // fullscreen + code panel
  private _codeTab: "html" | "css" | "combined" = "html";

  // selection, null at boot
  selectedElement: HTMLElement | null = null;
  private selectedNodeId: string | null = null;

  private interactKeyPressed = false; // TEMP: allow interaction while holding "a"

  // grid assist for freeform
  gridSize = 20;

  @state()
  showGrid = false;

  shiftPressed = false;
  gridKeyPressed = false;

  // palette
  private componentQuery = ""; // for search
  private trayOpen = false; // search tray flag
  private suppressNextClick = false;

  // basically a "favorites" list for quick access in the palette; can be extended in the future to track usage and auto-populate
  private oftenUsed: string[] = [
    "h1",
    "paragraph",
    "image",
    "button",
    "link",
    "divider",
    "icon",
  ];

  // info popup
  private infoForType: string | null = null;
  private infoAnchorEl: HTMLElement | null = null;

  // layout mode + nodes model, default is freeform
  private layoutMode: LayoutMode = "freeform";

  // --- per-layout state ---
  private freeformNodes: BuilderNode[] = [];
  private orderedNodes: BuilderNode[] = []; // shared by flow/flex/grid

  // container settings (global)
  private flexSettings: FlexSettings = defaultFlexSettings();
  private gridSettings: GridSettings = defaultGridSettings();

  // code generator
  private exporter = new BuilderExporter();

  // --- drag sort state (ordered layouts) ---
  private _sortDragging = false;
  private _sortDragId: string | null = null;
  private _sortPointerId: number | null = null;
  private _sortStartIndex = -1;
  private _sortCurrentIndex = -1;

  private _dragEl: HTMLElement | null = null;
  private _placeholderEl: HTMLElement | null = null;

  private _dragOffsetX = 0;
  private _dragOffsetY = 0;

  private _rafMovePending = false;
  private _lastPointerX = 0;
  private _lastPointerY = 0;

  // LitElementWw scopes to shadowDOM so we have to re-register shoelace's custom elements here
  static get scopedElements() {
    return shoelaceScoped;
  }

  /**
   * Fullscreen flag for this component
   * @returns true if this element is the fullscreenElement
   */
  get isFullscreen() {
    return this.ownerDocument.fullscreenElement === this;
  }

  /**
   * Setup instance
   * @returns void
   */
  constructor() {
    super();
  }

  // CSS
  static styles = builderStyles;

  /**
   * Main UI render
   * @returns Lit template
   */
  render() {
    // grid overlay only on key or toggle
    const showGridOverlay = this.showGrid || this.gridKeyPressed;

    // Only show code panel in fullscreen
    const split = this.isFullscreen;

    // get code tuple from code builder
    const { html: outHtml, css: outCss, combined } = this._generateExport();

    // main page, in fullscreen settings sidebar becomes the left column wrapper
    return html`
      <div class="layout ${split ? "fullscreen-split" : ""}">
        <!-- Sidebar (in fullscreen it becomes hidden) -->
        <div part="options" style=${split ? "display:none;" : ""}>
          <div class="settings">
            <h2>${wbGear} ${msg("Settings")}</h2>

            <!-- <div class="settings-row">
              <sl-switch
                .checked=${this.showGrid} 
                @sl-change=${(e: CustomEvent) => {
              this.showGrid = e.detail.checked;
            }}
                >${msg("Show Grid")}</sl-switch
              >
            </div> -->

            <!-- <sl-divider style="--color: var(--sl-color-gray-600);"></sl-divider> -->

            <!-- Reset canvas button -->
            <div class="settings-row">
              <sl-button
                size="small"
                variant="default"
                @click=${this._confirmReset}
                title=${msg("Reset canvas")}
                style="margin-left: auto;"
              >
                ${msg("Reset Canvas")}
              </sl-button>
            </div>

            <!-- Layout and component settings (if no component is selected the selected component settings will be empty but layout settings will always be shown)  -->
            ${this._renderLayoutSettings()}
            ${this._renderSelectedComponentSettings()}
          </div>
        </div>

        <!-- Main editor area (make it full height if in fullscreen) -->
        <div class="editor" style=${split ? "height:100%;" : ""}>
          <!-- upper row -->
          ${this._renderPalette()}

          <!-- Canvas -->
          <div
            class="canvas"
            @dragover=${this._onDragOver}
            @drop=${this._onDrop}
            style="--grid-size: ${this.gridSize}px"
            @click=${this._onCanvasClick}
          >
            <!-- Show grid overlay if enabled, otherwise just the drop zone if there are no nodes -->
            ${showGridOverlay ? html`<div class="grid-overlay"></div>` : null}
            ${this._renderCanvasInner()}

            <!-- Hovering fullscreen button -->
            <div class="fs-btn">
              <sl-button
                size="small"
                variant="primary"
                @click=${this._toggleFullscreen}
              >
                <!-- Icon changes based on fullscreen state -->
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
              <div class="code-panel" aria-label="Code">
                <div class="code-header">
                  <div class="code-title">Code</div>

                  <div class="code-tabs" role="tablist" aria-label="Code tabs">
                    ${this._codeTabBtn("combined", "Combined")}
                    ${this._codeTabBtn("html", "HTML")}
                    ${this._codeTabBtn("css", "CSS")}
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
      </div>
    `;
  }

  /**
   * lets you switch code tabs in the code panel (only visible in fullscreen)
   * @returns Lit template
   */
  private _codeTabBtn(tab: "html" | "css" | "combined", label: string) {
    const active = this._codeTab === tab;
    return html`
      <button
        class="code-tab ${active ? "active" : ""}"
        @click=${() => {
          this._codeTab = tab;
          this.requestUpdate();
        }}
        type="button"
        role="tab"
        aria-selected=${active ? "true" : "false"}
      >
        ${label}
      </button>
    `;
  }

  /* ===== Palette UI ===== */

  /**
   * Palette: search + quick row + results tray + info popup
   * @returns Lit template
   */
  private _renderPalette() {
    const q = this.componentQuery.trim(); // search query gotten from global value, trim to check if there is any real content
    const searching = q.length > 0; // query active or not

    const results = searching ? this._getPaletteItems() : []; // get search results based on query, only if searching is active
    const quick = this.oftenUsed.filter((t) => ComponentRegistry[t]); // sanity check, filter often used list to only include valid components, this is what is shown in the "often used" row in the palette. Can be removed later

    return html`
      <div class="palette">
        <div class="palette-top">
          <div class="palette-search">
            <!-- Search input, updates global query value on input and opens tray if there is any real content, if cleared it also closes the tray. On focus it opens the tray if there is any real content in the query -->
            <sl-input
              size="small"
              clearable
              placeholder=${msg("Search components…")}
              .value=${this.componentQuery}
              @sl-input=${(e: any) => {
                this.componentQuery = String(e.target.value ?? "");
                this.trayOpen = this.componentQuery.trim().length > 0;
                this.requestUpdate();
              }}
              @sl-clear=${() => {
                this.componentQuery = "";
                this.trayOpen = false;
                this.requestUpdate();
              }}
              @focus=${() => {
                if (this.componentQuery.trim().length > 0) {
                  this.trayOpen = true;
                  this.requestUpdate();
                }
              }}
            ></sl-input>
          </div>

          <div class="seg" aria-label="Layout mode">
            ${this._layoutBtn("freeform", "Freeform")}
            ${this._layoutBtn("flow", "Flow")}
            ${this._layoutBtn("flex", "Flex")}
            ${this._layoutBtn("grid", "Grid")}
          </div>
        </div>

        ${!searching
          ? html`
              <!-- render tiles for often used components only if there is no active search query, this row is hidden as soon as you start searching -->
              <div class="quick-row" aria-label="Often used components">
                ${quick.map((t) => this._tile(t, { compact: true }))}
              </div>
            `
          : null}

        <!-- ?hidden makes elements hidden until a certain condition is met, in this case the search query being empty and the tray with the search results is shown, if not it is hidden -->
        <div class="tray" ?hidden=${!(this.trayOpen && searching)}>
          <div class="tray-header">
            <div class="tray-title">Results</div>
            <div class="tray-count">${results.length}</div>
          </div>

          <!-- show reslts grid with their corresponding tiles -->
          <div class="tray-inner">
            <div class="results-grid">
              ${results.map((t) => this._tile(t, { compact: false }))}
            </div>
          </div>
        </div>

        <!-- Info popup for components if clicked on -->
        ${this._renderInfoPopup()}
      </div>
    `;
  }

  /**
   * highlight currently active layout mode button and set layout mode on click
   * @returns Lit template
   */
  private _layoutBtn(mode: LayoutMode, label: string) {
    const active = this.layoutMode === mode;
    return html`
      <button
        class="seg-btn ${active ? "active" : ""}"
        @click=${() => this._setLayoutMode(mode)}
        type="button"
        title=${`Switch layout to ${mode}`}
      >
        ${label}
      </button>
    `;
  }

  /**
   * get tile for component type with click handlers for adding to canvas and showing info popup
   * @returns component type ids
   */
  private _getPaletteItems(): string[] {
    const q = this.componentQuery.trim().toLowerCase(); // query in lowercase for easier matching
    const allTypes = Object.keys(ComponentRegistry); // returns the strings of all registered component types as an array

    // return the filtered and sorted list of component types based on the search query
    const searched = q
      ? allTypes.filter((t) => {
          const comp = ComponentRegistry[t]; // get component info from registry
          const label = (comp?.label ?? t).toLowerCase(); // check if it exists and get label in lowercase
          return t.toLowerCase().includes(q) || label.includes(q); // keep if type or label includes query term
        })
      : allTypes; // if no query, return all types

    // sorts descending based on label, if no label then type
    return searched.sort((a, b) => {
      const la = (ComponentRegistry[a]?.label ?? a).toLowerCase();
      const lb = (ComponentRegistry[b]?.label ?? b).toLowerCase();
      return la.localeCompare(lb);
    });
  }

  /* ===== Canvas rendering per mode ===== */

  /**
   * Canvas root content for current layout mode
   * @returns Lit template
   */
  private _renderCanvasInner() {
    const nodes = this._activeNodes();
    const empty = nodes.length === 0; // if no components have been added to the canvas

    // render a drag and drop zone
    if (empty) {
      return html`<div class="drop-zone">Drag and drop components here</div>`;
    }

    // render all nodes based on selected layout mode, freeform has its own rendering function because of the absolute positioning, the other modes can share a rendering function since they all use the same flow layout and only differ in the container styles
    if (this.layoutMode === "freeform") {
      return html`
        <div class="freeform-root">
          ${repeat(
            nodes,
            (n) => n.id,
            (n) => this._renderNodeFreeform(n),
          )}
        </div>
      `;
    }

    if (this.layoutMode === "flow") {
      const sorted = this._sortedNodes();
      return html`
        <div class="flow-root">
          ${repeat(
            sorted,
            (n) => n.id,
            (n) => this._renderNodeFlow(n),
          )}
        </div>
      `;
    }

    if (this.layoutMode === "flex") {
      const sorted = this._sortedNodes();
      const style = this._flexContainerStyle();
      return html`
        <div class="flex-root" style=${style}>
          ${repeat(
            sorted,
            (n) => n.id,
            (n) => this._renderNodeFlow(n),
          )}
        </div>
      `;
    }

    // grid
    const sorted = this._sortedNodes();
    const style = this._gridContainerStyle();
    return html`
      <div class="grid-root" style=${style}>
        ${repeat(
          sorted,
          (n) => n.id,
          (n) => this._renderNodeFlow(n),
        )}
      </div>
    `;
  }

  /**
   * Sort nodes by order
   * @returns ordered nodes
   */
  private _sortedNodes() {
    return sortedNodes(this._activeNodes());
  }

  /**
   * Render node wrapper for freeform (absolute positioned)
   * @returns Lit template | null if type not registered
   */
  private _renderNodeFreeform(n: BuilderNode) {
    const comp = ComponentRegistry[n.type]; // get component info from registry based on node type
    if (!comp) return null; // if component type is not found in registry, return null to avoid errors

    const pos = n.pos ?? { x: 32, y: 32 }; // get position or if non-existant set default position
    const selected = this.selectedNodeId === n.id; // check if node is selected for styling purposes

    // render the component using its render function and pass in the node data, also add click handlers for selection and mouse down for dragging, set styles for absolute positioning and cursor. Use default data if no data exists for the node
    return html`
      <div
        class="builder-element ${selected ? "selected" : ""}"
        data-node-id=${n.id}
        data-component-type=${n.type}
        style="
          position:absolute;
          left:${pos.x}px;
          top:${pos.y}px;
          cursor:grab;
        "
        @pointerdown=${(e: PointerEvent) => this._onWrapperPointerDown(e, n.id)}
        @click=${(e: MouseEvent) => this._onWrapperClick(e, n.id)}
      >
        <div class="drag-shell">${comp.render(n.data ?? comp.defaultData)}</div>
      </div>
    `;
  }

  /**
   * render node for flow, flex and grid layout modes since they all share the same flow item styles and only differ in the container styles,
   * also add click handler for selection and set data-display attribute for block or inline display based on node setting, use default data if no data exists for the node
   * @returns Lit template | null if type not registered
   */
  private _renderNodeFlow(n: BuilderNode) {
    const comp = ComponentRegistry[n.type];
    if (!comp) return null;

    const selected = this.selectedNodeId === n.id;
    const display = n.display ?? "block"; // set display setting to either block or inline based on node setting, default to block if not set ( for some reason? )

    return html`
      <div
        class="builder-element flow-item ${selected ? "selected" : ""}"
        data-node-id=${n.id}
        data-component-type=${n.type}
        data-display=${display}
        @pointerdown=${(e: PointerEvent) => this._onWrapperPointerDown(e, n.id)}
        @click=${(e: MouseEvent) => this._onWrapperClick(e, n.id)}
      >
        <div class="drag-shell">${comp.render(n.data ?? comp.defaultData)}</div>
      </div>
    `;
  }

  private _allowInteractEvent(_e: any) {
    return this.interactKeyPressed;
  }

  private _onWrapperPointerDown(e: PointerEvent, nodeId: string) {
    console.log("allowInteract?", this.interactKeyPressed);

    const interactive = this._isInteractiveTarget(e.target);
    const allowInteract = this._allowInteractEvent(e);

    // If modifier held and user is on interactive control: allow native behavior (video controls, links, etc.)
    if (interactive && allowInteract) {
      return;
    }

    // If interactive but modifier NOT held: block interaction (so controls don't engage)
    if (interactive && !allowInteract) {
      e.preventDefault();
      e.stopPropagation();
      this._selectNodeId(nodeId);

      // In freeform: start dragging from this pointerdown
      if (this.layoutMode === "freeform") {
        this._startFreeformDragFromPointer(e, nodeId);
      }
      return;
    }

    // Non-interactive area:
    this._selectNodeId(nodeId);

    if (this.layoutMode === "freeform") {
      this._startFreeformDragFromPointer(e, nodeId);
    } else {
      this._startOrderedSortDrag(e, nodeId);
    }
  }

  private _onWrapperClick(e: MouseEvent, nodeId: string) {
    const interactive = this._isInteractiveTarget(e.target);
    const allowInteract = this._allowInteractEvent(e);

    if (interactive && allowInteract) return;

    if (interactive && !allowInteract) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private _startOrderedSortDrag(e: PointerEvent, nodeId: string) {
    if (this.layoutMode === "freeform") return;

    const root = this.renderRoot.querySelector(
      this.layoutMode === "flow"
        ? ".flow-root"
        : this.layoutMode === "flex"
          ? ".flex-root"
          : ".grid-root",
    ) as HTMLElement | null;
    if (!root) return;

    const el = this.renderRoot.querySelector(
      `[data-node-id="${nodeId}"]`,
    ) as HTMLElement | null;
    if (!el) return;

    // Only reorder if pointerdown is not on an interactive control unless user allows interact
    if (this._isInteractiveTarget(e.target) && this._allowInteractEvent(e))
      return;
    if (this._isInteractiveTarget(e.target) && !this._allowInteractEvent(e)) {
      e.preventDefault();
      e.stopPropagation();
    }

    // pointer capture
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}

    const ordered = sortedNodes(this.orderedNodes);
    const startIndex = ordered.findIndex((n) => n.id === nodeId);
    if (startIndex < 0) return;

    // measure and create placeholder
    const r = el.getBoundingClientRect();
    const placeholder = document.createElement("div");
    placeholder.className = "drag-placeholder";
    placeholder.style.width = `${r.width}px`;
    placeholder.style.height = `${r.height}px`;

    // insert placeholder where the element is
    el.after(placeholder);

    // move dragged element to fixed layer
    const offsetX = e.clientX - r.left;
    const offsetY = e.clientY - r.top;

    el.classList.add("dragging");
    el.style.position = "fixed";
    el.style.left = `${r.left}px`;
    el.style.top = `${r.top}px`;
    el.style.width = `${r.width}px`;
    el.style.height = `${r.height}px`;
    el.style.margin = "0";
    el.style.transform = "translate3d(0,0,0)";

    this._sortDragging = true;
    this._sortDragId = nodeId;
    this._sortPointerId = e.pointerId;
    this._sortStartIndex = startIndex;
    this._sortCurrentIndex = startIndex;

    this._dragEl = el;
    this._placeholderEl = placeholder;
    this._dragOffsetX = offsetX;
    this._dragOffsetY = offsetY;

    const onMove = (ev: PointerEvent) => this._onOrderedSortMove(ev);
    const onUp = (ev: PointerEvent) => this._finishOrderedSortDrag(ev);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });

    // keep references so we can remove move handler
    (this as any)._orderedMoveHandler = onMove;
  }

  private _onOrderedSortMove(ev: PointerEvent) {
    if (!this._sortDragging || !this._dragEl || !this._placeholderEl) return;

    this._lastPointerX = ev.clientX;
    this._lastPointerY = ev.clientY;

    if (this._rafMovePending) return;
    this._rafMovePending = true;

    requestAnimationFrame(() => {
      this._rafMovePending = false;
      this._orderedSortMoveFrame(this._lastPointerX, this._lastPointerY);
    });
  }

  private _orderedSortMoveFrame(clientX: number, clientY: number) {
    if (!this._sortDragging || !this._dragEl || !this._placeholderEl) return;

    // 1) Move dragged element using left/top only ✅ (fast + stable)
    const x = clientX - this._dragOffsetX;
    const y = clientY - this._dragOffsetY;
    this._dragEl.style.left = `${x}px`;
    this._dragEl.style.top = `${y}px`;

    const root = this.renderRoot.querySelector(
      this.layoutMode === "flow"
        ? ".flow-root"
        : this.layoutMode === "flex"
          ? ".flex-root"
          : ".grid-root",
    ) as HTMLElement | null;
    if (!root) return;

    const items = Array.from(
      root.querySelectorAll(".flow-item"),
    ) as HTMLElement[];

    // FLIP "first"
    const first = new Map<HTMLElement, DOMRect>();
    for (const it of items) first.set(it, it.getBoundingClientRect());

    // 2) Compute insertion index
    const nextIndex = this._computeInsertionIndex(root, clientX, clientY);
    if (nextIndex !== this._sortCurrentIndex) {
      this._sortCurrentIndex = nextIndex;

      // Move placeholder relative to non-drag siblings
      const siblings = items.filter((it) => it !== this._dragEl);
      const ref = siblings[nextIndex] ?? null;
      if (ref) root.insertBefore(this._placeholderEl, ref);
      else root.appendChild(this._placeholderEl);
    }

    // FLIP "last"
    const last = new Map<HTMLElement, DOMRect>();
    for (const it of items) last.set(it, it.getBoundingClientRect());

    for (const it of items) {
      if (it === this._dragEl) continue;
      const a = first.get(it);
      const b = last.get(it);
      if (!a || !b) continue;

      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (dx || dy) {
        it.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        it.getBoundingClientRect(); // reflow to apply transform
        it.style.transform = "";
      }
    }
  }

  private _computeInsertionIndex(
    root: HTMLElement,
    x: number,
    y: number,
  ): number {
    const items = Array.from(
      root.querySelectorAll(".flow-item"),
    ) as HTMLElement[];
    const candidates = items.filter((el) => el !== this._dragEl);

    if (candidates.length === 0) return 0;

    // FLOW: robust list logic (always allows moving before/after any item)
    if (this.layoutMode === "flow") {
      // append if pointer is below last midline
      for (let i = 0; i < candidates.length; i++) {
        const r = candidates[i].getBoundingClientRect();
        if (y < r.top + r.height / 2) return i;
      }
      return candidates.length; // append at end ✅
    }

    // FLEX/GRID: nearest center but allow explicit "append to end"
    let bestIdx = 0;
    let bestDist = Infinity;

    for (let i = 0; i < candidates.length; i++) {
      const r = candidates[i].getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = dx * dx + dy * dy;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    // If pointer is "past" the last candidate visually, append.
    const lastRect = candidates[candidates.length - 1].getBoundingClientRect();
    if (y > lastRect.bottom + 8 || x > lastRect.right + 8) {
      return candidates.length; // append ✅
    }

    const r = candidates[bestIdx].getBoundingClientRect();
    const after =
      Math.abs(x - (r.left + r.width / 2)) >
      Math.abs(y - (r.top + r.height / 2))
        ? x > r.left + r.width / 2
        : y > r.top + r.height / 2;

    return after ? bestIdx + 1 : bestIdx;
  }

  private _finishOrderedSortDrag(ev: PointerEvent) {
    const moveHandler = (this as any)._orderedMoveHandler as
      | ((e: PointerEvent) => void)
      | undefined;
    if (moveHandler) window.removeEventListener("pointermove", moveHandler);

    if (
      !this._sortDragging ||
      !this._dragEl ||
      !this._placeholderEl ||
      !this._sortDragId
    ) {
      this._resetOrderedDragArtifacts();
      return;
    }

    const root = this.renderRoot.querySelector(
      this.layoutMode === "flow"
        ? ".flow-root"
        : this.layoutMode === "flex"
          ? ".flex-root"
          : ".grid-root",
    ) as HTMLElement | null;

    // final index in DOM (placeholder position among non-drag siblings)
    const siblings = root
      ? (Array.from(root.querySelectorAll(".flow-item")).filter(
          (el) => el !== this._dragEl,
        ) as HTMLElement[])
      : [];

    let to = this._sortCurrentIndex;
    if (root && this._placeholderEl.parentElement === root) {
      to = 0;
      for (const child of Array.from(root.children)) {
        if (child === this._placeholderEl) break;
        const el = child as HTMLElement;
        if (el.classList.contains("flow-item") && el !== this._dragEl) to++;
      }
    }

    // Animate dragged element into placeholder rect
    const targetRect = this._placeholderEl.getBoundingClientRect();
    const currentRect = this._dragEl.getBoundingClientRect();

    const dx = targetRect.left - currentRect.left;
    const dy = targetRect.top - currentRect.top;

    this._dragEl
      .querySelector(".drag-shell")
      ?.animate(
        [
          { transform: "translateZ(0) scale(1.03)" },
          { transform: "translateZ(0) scale(1)" },
        ],
        { duration: 140, easing: "cubic-bezier(.2,.8,.2,1)" },
      );

    this._dragEl.animate(
      [
        { transform: this._dragEl.style.transform || "translate3d(0,0,0)" },
        {
          transform: `translate3d(${(this._dragEl.style.transform ? 0 : 0) + dx}px, ${(this._dragEl.style.transform ? 0 : 0) + dy}px, 0)`,
        },
      ],
      { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" },
    ).onfinish = () => {
      // commit reorder to orderedNodes
      const ordered = sortedNodes(this.orderedNodes);
      const from = ordered.findIndex((n) => n.id === this._sortDragId);
      if (from >= 0) {
        const [moved] = ordered.splice(from, 1);
        ordered.splice(to, 0, moved);
        this.orderedNodes = normalizeOrder(ordered);
      }

      this._resetOrderedDragArtifacts();
      this.requestUpdate();
    };

    try {
      this._dragEl.releasePointerCapture(this._sortPointerId ?? ev.pointerId);
    } catch {}
  }

  private _resetOrderedDragArtifacts() {
    if (this._dragEl) {
      this._dragEl.classList.remove("dragging");
      this._dragEl.style.position = "";
      this._dragEl.style.left = "";
      this._dragEl.style.top = "";
      this._dragEl.style.width = "";
      this._dragEl.style.height = "";
      this._dragEl.style.margin = "";
      this._dragEl.style.transform = "";
    }
    if (this._placeholderEl?.parentElement)
      this._placeholderEl.parentElement.removeChild(this._placeholderEl);

    this._sortDragging = false;
    this._sortDragId = null;
    this._sortPointerId = null;
    this._sortStartIndex = -1;
    this._sortCurrentIndex = -1;

    this._dragEl = null;
    this._placeholderEl = null;
  }

  /* ===== Layout settings (global) ===== */

  /**
   * Render global layout settings UI for flex/grid
   * @returns Lit template | null
   */
  private _renderLayoutSettings() {
    if (this.layoutMode === "flex") {
      const flex = this._getFlexSettings(); // get current flex settings to populate the layout settings UI with the current values
      return html`
        <div style="margin-top: 1rem">
          <h2 style="margin-top: 0">Layout</h2>

          <!-- populate flex settings with current values and update settings on change, for select inputs use predefined options based on valid CSS values for the corresponding property, for gap use a text input to allow custom values -->
          <div class="setting-row">
            <sl-select
              label="Direction"
              value=${flex.direction ?? "row"}
              @sl-change=${(e: any) =>
                this._setFlexSettings({ direction: e.target.value })}
            >
              <sl-option value="row">row</sl-option>
              <sl-option value="column">column</sl-option>
            </sl-select>
          </div>

          <div class="setting-row">
            <sl-select
              label="Justify content"
              value=${flex.justify ?? "flex-start"}
              @sl-change=${(e: any) =>
                this._setFlexSettings({ justify: e.target.value })}
            >
              <sl-option value="flex-start">flex-start</sl-option>
              <sl-option value="center">center</sl-option>
              <sl-option value="flex-end">flex-end</sl-option>
              <sl-option value="space-between">space-between</sl-option>
              <sl-option value="space-around">space-around</sl-option>
              <sl-option value="space-evenly">space-evenly</sl-option>
            </sl-select>
          </div>

          <div class="setting-row">
            <sl-select
              label="Align items"
              value=${flex.align ?? "stretch"}
              @sl-change=${(e: any) =>
                this._setFlexSettings({ align: e.target.value })}
            >
              <sl-option value="stretch">stretch</sl-option>
              <sl-option value="flex-start">flex-start</sl-option>
              <sl-option value="center">center</sl-option>
              <sl-option value="flex-end">flex-end</sl-option>
              <sl-option value="baseline">baseline</sl-option>
            </sl-select>
          </div>

          <div class="setting-row">
            <sl-select
              label="Wrap"
              value=${flex.wrap ?? "nowrap"}
              @sl-change=${(e: any) =>
                this._setFlexSettings({ wrap: e.target.value })}
            >
              <sl-option value="nowrap">nowrap</sl-option>
              <sl-option value="wrap">wrap</sl-option>
            </sl-select>
          </div>

          <div class="setting-row">
            <sl-input
              label="Gap"
              placeholder="e.g. 12px"
              .value=${flex.gap ?? "12px"}
              @sl-input=${(e: any) =>
                this._setFlexSettings({ gap: String(e.target.value ?? "") })}
            ></sl-input>
          </div>
        </div>
      `;
    }

    if (this.layoutMode === "grid") {
      const grid = this._getGridSettings();
      return html`
        <div style="margin-top: 1rem">
          <h2 style="margin-top: 0">Layout</h2>

          <div class="setting-row">
            <sl-input
              label="Columns"
              placeholder="e.g. repeat(3, 1fr)"
              .value=${grid.columns ?? "repeat(3, 1fr)"}
              @sl-input=${(e: any) =>
                this._setGridSettings({
                  columns: String(e.target.value ?? ""),
                })}
            ></sl-input>
          </div>

          <div class="setting-row">
            <sl-input
              label="Rows"
              placeholder="e.g. auto"
              .value=${grid.rows ?? "auto"}
              @sl-input=${(e: any) =>
                this._setGridSettings({ rows: String(e.target.value ?? "") })}
            ></sl-input>
          </div>

          <div class="setting-row">
            <sl-input
              label="Gap"
              placeholder="e.g. 12px"
              .value=${grid.gap ?? "12px"}
              @sl-input=${(e: any) =>
                this._setGridSettings({ gap: String(e.target.value ?? "") })}
            ></sl-input>
          </div>
        </div>
      `;
    }

    return null;
  }

  /**
   * Flex container inline style from settings
   * @returns style string
   */
  private _flexContainerStyle(): string {
    const f = this._getFlexSettings();
    const direction = f.direction ?? "row";
    const justify = f.justify ?? "flex-start";
    const align = f.align ?? "stretch";
    const wrap = f.wrap ?? "nowrap";
    const gap = f.gap ?? "12px";
    return `flex-direction:${direction}; justify-content:${justify}; align-items:${align}; flex-wrap:${wrap}; gap:${gap};`;
  }

  /**
   * Grid container inline style from settings
   * @returns style string
   */
  private _gridContainerStyle(): string {
    const g = this._getGridSettings();
    const cols = g.columns ?? "repeat(3, 1fr)";
    const rows = g.rows ?? "auto";
    const gap = g.gap ?? "12px";
    return `grid-template-columns:${cols}; grid-auto-rows:${rows}; gap:${gap};`;
  }

  /**
   * Read flex settings
   * @returns current flex settings
   */
  private _getFlexSettings() {
    return this.flexSettings;
  }

  /**
   * Patch flex settings
   * @returns void
   */
  private _setFlexSettings(patch: Partial<FlexSettings>) {
    this.flexSettings = { ...this._getFlexSettings(), ...patch };
    this.requestUpdate();
  }

  /**
   * Read grid settings
   * @returns current grid settings
   */
  private _getGridSettings() {
    return this.gridSettings;
  }

  /**
   * Patch grid settings
   * @returns void
   */
  private _setGridSettings(patch: Partial<GridSettings>) {
    this.gridSettings = { ...this._getGridSettings(), ...patch };
    this.requestUpdate();
  }

  /* ===== Selection + per-node settings ===== */

  /**
   * Selected node settings UI:
   * - custom settings (component.settings)
   * - flow display setting (block/inline)
   * - bindings inputs (component.bindings)
   * render the settings for the currently selected component, if there is no selected component or the component type is not found in the registry return null to not render anything,
   * if the component has a custom settings function render its output,
   * if the layout mode is flow also render display settings for block or inline display,
   * if the component has bindings render input fields for each binding and update node data on input
   * @returns Lit template | null
   */
  private _renderSelectedComponentSettings() {
    const node = this._getSelectedNode();
    if (!node) return null;

    const component = ComponentRegistry[node.type];
    if (!component) return null;

    const custom = component.settings
      ? component.settings({
          data: node.data ?? {},
          setData: (patch) => {
            this._setActiveNodes(
              this._activeNodes().map((n) =>
                n.id === node.id
                  ? { ...n, data: { ...(n.data ?? {}), ...patch } }
                  : n,
              ),
            );
            this.requestUpdate();
          },
        })
      : null;

    const flowDisplayUI =
      this.layoutMode === "flow"
        ? html`
            <div style="margin-top: 1rem">
              <h2 style="margin-top: 0">${this.msg("Flow")}</h2>
              <div class="setting-row">
                <sl-select
                  label="Display"
                  value=${node.display ?? "block"}
                  @sl-change=${(e: any) => {
                    const v = e.target.value as "block" | "inline";
                    this._updateNode(node.id, { display: v });
                  }}
                >
                  <sl-option value="block">block</sl-option>
                  <sl-option value="inline">inline</sl-option>
                </sl-select>
              </div>
            </div>
          `
        : null;

    const bindingsUI = component.bindings?.length
      ? html`
          <div style="margin-top: 1rem">
            <h2 style="margin-top: 0">${this.msg("Content")}</h2>

            ${component.bindings.map((b) => {
              const current = this._readBindingFromNode(node, b);

              return html`
                <div class="setting-row">
                  <sl-input
                    label=${b.label}
                    .value=${current}
                    placeholder=${b.placeholder ?? ""}
                    @sl-input=${(e: CustomEvent) => {
                      const input = e.target as any;
                      const value = String(input.value ?? "");
                      this._writeBindingToNode(node.id, b, value);
                    }}
                  ></sl-input>
                </div>
              `;
            })}
          </div>
        `
      : null;

    return html`
      <div style="margin-top: 1rem">
        ${custom ?? null} ${flowDisplayUI} ${bindingsUI}
      </div>
    `;
  }

  /**
   * Get selected node by id
   * @returns node | null
   */
  private _getSelectedNode(): BuilderNode | null {
    if (!this.selectedNodeId) return null;
    const nodes = this._activeNodes();
    return nodes.find((n) => n.id === this.selectedNodeId) ?? null;
  }

  /**
   * Patch a node by id
   * @returns void
   */
  private _updateNode(id: string, patch: Partial<BuilderNode>) {
    const nodes = this._activeNodes().map((n) =>
      n.id === id ? { ...n, ...patch } : n,
    );
    this._setActiveNodes(nodes);
  }

  /**
   * Read a binding value from node.data
   * @returns string (empty if missing)
   */
  private _readBindingFromNode(node: BuilderNode, b: ComponentBinding): string {
    const v = node.data?.[b.key];
    return v == null ? "" : String(v);
  }

  /**
   * Write a binding value into node.data
   * @returns void
   */
  private _writeBindingToNode(id: string, b: ComponentBinding, value: string) {
    this._setActiveNodes(
      this._activeNodes().map((n) => {
        if (n.id !== id) return n;
        return { ...n, data: { ...(n.data ?? {}), [b.key]: value } };
      }),
    );
    this.requestUpdate();
  }

  /* ===== State persistence ===== */

  /**
   * Serialize current builder state for webwriter-state
   * @returns serialized string
   */
  private _serializeState(): string {
    return serializeBuilderState({
      layoutMode: this.layoutMode,
      freeformNodes: this.freeformNodes,
      orderedNodes: this.orderedNodes,

      showGrid: this.showGrid,
      gridSize: this.gridSize,
      flexSettings: this._getFlexSettings(),
      gridSettings: this._getGridSettings(),
    });
  }

  /**
   * Apply serialized builder state to fields
   * @returns void
   */
  private _applyState(serialized: string) {
    const parsed = parseBuilderState(serialized);
    if (!parsed) return;

    this.layoutMode = parsed.layoutMode;

    this.freeformNodes = parsed.freeformNodes ?? [];
    this.orderedNodes = parsed.orderedNodes ?? parsed.nodes ?? []; // backwards compat

    this.showGrid = parsed.showGrid;
    this.gridSize = parsed.gridSize;

    this.flexSettings = parsed.flexSettings;
    this.gridSettings = parsed.gridSettings;

    this._clearSelection();
  }

  /* ===== Code export ===== */

  /**
   * Generate export code for current state
   * @returns { html, css, combined }
   */
  private _generateExport(): { html: string; css: string; combined: string } {
    return this.exporter.generateExport({
      layoutMode: this.layoutMode,
      nodes: this._activeNodes(),
      flexSettings: this._getFlexSettings(),
      gridSettings: this._getGridSettings(),
    });
  }

  /* ===== Info popup ===== */

  /**
   * Info popup for clicked tile (syntax preview + insert)
   * @returns Lit template | null
   */
  private _renderInfoPopup() {
    if (!this.infoForType || !this.infoAnchorEl) return null;

    const comp = ComponentRegistry[this.infoForType];
    const label = comp?.label ?? this.infoForType;

    const syntax = componentSyntaxHint(this.infoForType);

    const insert = () => {
      this._quickAdd(this.infoForType!);
      this.infoForType = null;
      this.infoAnchorEl = null;
      this.trayOpen = false;
      this.requestUpdate();
    };

    return html`
      <sl-popup
        placement="bottom-start"
        strategy="fixed"
        ?active=${true}
        .anchor=${this.infoAnchorEl}
      >
        <sl-card
          style="width: 320px;"
          @mousedown=${(e: MouseEvent) => e.stopPropagation()}
        >
          <div
            style="display:flex; align-items:center; justify-content:space-between; gap: 0.75rem;"
          >
            <div style="font-weight: 600; color: var(--sl-color-neutral-900);">
              ${msg(label)}
            </div>
            <sl-button size="small" variant="primary" @click=${insert}
              >Insert</sl-button
            >
          </div>

          <div
            style="margin-top: 0.4rem; font-size: 0.8rem; color: var(--sl-color-neutral-600);"
          >
            Drag to place on canvas. Click Insert to add at default position.
          </div>

          <div style="margin-top: 0.6rem;">
            <div
              style="font-size: 0.75rem; color: var(--sl-color-neutral-500); margin-bottom: 0.25rem;"
            >
              Syntax (preview)
            </div>
            <pre
              style="
                margin: 0;
                padding: 0.6rem;
                border-radius: 10px;
                background: var(--sl-color-neutral-50);
                border: 1px solid var(--sl-color-neutral-200);
                font-size: 0.75rem;
                overflow: auto;
              "
            >
${syntax}</pre
            >
          </div>
        </sl-card>
      </sl-popup>
    `;
  }

  /* ===== Tiles ===== */

  /**
   * Palette tile element (drag + click)
   * @returns Lit template
   */
  private _tile(type: string, opts: { compact: boolean }) {
    const comp = ComponentRegistry[type];
    const label = comp?.label ?? type;

    const onDragStart = (e: DragEvent) => {
      this.suppressNextClick = true;
      setTimeout(() => (this.suppressNextClick = false), 0);

      this._onDragStart(e);

      requestAnimationFrame(() => {
        this.trayOpen = false;
        this.requestUpdate();
      });
    };

    const onClick = (e: MouseEvent) => {
      if (this.suppressNextClick) return;
      e.stopPropagation();

      this.infoForType = type;
      this.infoAnchorEl = e.currentTarget as HTMLElement;
      this.requestUpdate();
    };

    return html`
      <div
        class="tile"
        draggable="true"
        data-component-type=${type}
        @dragstart=${onDragStart}
        @click=${onClick}
        title="Drag to canvas · Click for info"
        style=${opts.compact ? "height: 64px;" : "height: 72px;"}
      >
        <div class="tile-icon">${tileGlyph(type)}</div>
        <div class="tile-label">${msg(label)}</div>
      </div>
    `;
  }

  /**
   * Fullscreenchange handler (forces rerender such that the code panel is instantly shown instead of waiting for an additional rerender to happen)
   * @returns void
   */
  private _onFsChange = () => {
    console.warn("[fs] change", {
      fsEl: document.fullscreenElement?.tagName ?? null,
      isFs: document.fullscreenElement === this,
    });
    this.requestUpdate();
  };

  /**
   * Fullscreen error handler
   * @returns void
   */
  private _onFsError = (e: Event) => {
    console.warn("[fs] error", e);
  };

  /**
   * Toggle fullscreen on this element
   * @returns Promise<void>
   */
  private async _toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await this.requestFullscreen();
      }
    } finally {
      // ensures UI updates even if the event never shows up
      this.requestUpdate();
    }
  }

  /* ===== Global listeners ===== */

  /**
   * Lifecycle: attach listeners + hydrate webwriter-state
   * @returns void
   */
  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("fullscreenchange", this._onFsChange);
    document.addEventListener("fullscreenerror", this._onFsError);

    this._hydrating = true;
    const attr = this.getAttribute("ww-state") || "";
    this._applyState(attr);
    this._hydrating = false;

    window.addEventListener("mousedown", this._onGlobalMouseDown);
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }

  /**
   * Lifecycle: sync internal state <-> webwriter-state
   * @returns void
   */
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

  /**
   * Lifecycle: remove listeners
   * @returns void
   */
  disconnectedCallback() {
    document.removeEventListener("fullscreenchange", this._onFsChange);
    document.removeEventListener("fullscreenerror", this._onFsError);

    window.removeEventListener("mousedown", this._onGlobalMouseDown);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);

    super.disconnectedCallback();
  }

  /**
   * Close tray/popup when clicking outside palette (but inside component)
   * @returns void
   */
  private _onGlobalMouseDown = (e: MouseEvent) => {
    const path = e.composedPath();
    const clickedInsideThisComponent = path.includes(this);
    if (!clickedInsideThisComponent) return;

    const palette = this.shadowRoot?.querySelector(".palette");
    const clickedInsidePalette = palette ? path.includes(palette) : false;

    if (!clickedInsidePalette && (this.trayOpen || this.infoForType)) {
      this.trayOpen = false;
      this.infoForType = null;
      this.infoAnchorEl = null;
      this.requestUpdate();
    }
  };

  /* ===== Drag/drop ===== */

  /**
   * Start drag: stores component type in dataTransfer
   * @returns void
   */
  private _onDragStart(event: DragEvent) {
    const target = event.target as HTMLElement;
    const type = target.getAttribute("data-component-type");
    event.dataTransfer?.setData("component-type", type ?? "");
  }

  /**
   * Allow drop
   * @returns void
   */
  private _onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  /**
   * Drop handler: routes to freeform or flow-like insertion
   * @returns void
   */
  private _onDrop(event: DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer?.getData("component-type");
    if (!type) return;

    const component = ComponentRegistry[type];
    if (!component) return;

    if (this.layoutMode === "freeform") {
      this._dropFreeform(event, type);
      return;
    }

    this._dropFlowLike(event, type);
  }

  /**
   * Drop in freeform: positions node by mouse coords
   * @returns void
   */
  private _dropFreeform(event: DragEvent, type: string) {
    const canvasEl = this.shadowRoot!.querySelector(".canvas");
    if (!(canvasEl instanceof HTMLElement)) return;

    const rect = canvasEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const node: BuilderNode = {
      id: crypto.randomUUID(),
      type,
      data: structuredClone(ComponentRegistry[type]?.defaultData ?? {}),
      pos: { x, y },
      order: this._activeNodes().length,
      display: "block",
    };

    this._setActiveNodes([...this._activeNodes(), node]);
    this._selectNodeId(node.id);
  }

  /**
   * Drop in flow-like modes: insert by vertical position
   * @returns void
   */
  private _dropFlowLike(event: DragEvent, type: string) {
    const root = this.renderRoot.querySelector(
      this.layoutMode === "flow"
        ? ".flow-root"
        : this.layoutMode === "flex"
          ? ".flex-root"
          : ".grid-root",
    ) as HTMLElement | null;

    const items = root
      ? (Array.from(root.querySelectorAll(".flow-item")) as HTMLElement[])
      : [];

    const y = event.clientY;
    let insertIndex = items.length;

    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        insertIndex = i;
        break;
      }
    }

    const node: BuilderNode = {
      id: crypto.randomUUID(),
      type,
      data: structuredClone(ComponentRegistry[type]?.defaultData ?? {}),
      order: insertIndex,
      display: "block",
    };

    const sorted = this._sortedNodes();
    sorted.splice(insertIndex, 0, node);
    this._setActiveNodes(sorted);
    this._normalizeOrder();

    this._selectNodeId(node.id);
  }

  /**
   * Normalize node.order values
   * @returns void
   */
  private _normalizeOrder() {
    this._setActiveNodes(normalizeOrder(this._activeNodes()));
  }

  /**
   * Quick insert (from info popup): append with default position/order
   * @returns void
   */
  private _quickAdd(type: string) {
    const component = ComponentRegistry[type];
    if (!component) return;

    if (this.layoutMode === "freeform") {
      const node: BuilderNode = {
        id: crypto.randomUUID(),
        type,
        data: structuredClone(component.defaultData ?? {}),
        pos: { x: 32, y: 32 },
        order: this._activeNodes().length,
        display: "block",
      };
      this._setActiveNodes([...this._activeNodes(), node]);
      this._selectNodeId(node.id);
      return;
    }

    const node: BuilderNode = {
      id: crypto.randomUUID(),
      type,
      data: structuredClone(component.defaultData ?? {}),
      order: this._activeNodes().length,
      display: "block",
    };
    this._setActiveNodes([...this._activeNodes(), node]);
    this._normalizeOrder();
    this._selectNodeId(node.id);
  }

  /* ===== Selection helpers ===== */

  /**
   * Select node wrapper; prevent link navigation unless modifier key
   * @returns void
   */
  private _selectNodeFromWrapper(e: MouseEvent, id: string) {
    e.stopPropagation();

    if (this._isInteractiveTarget(e.target) && this._allowInteract(e)) return;

    this._blurActive();

    const allowInteract = this._allowInteract(e);

    // If click originated from an interactive element, block its default action unless modifier pressed
    if (this._isInteractiveTarget(e.target) && !allowInteract) {
      e.preventDefault();
    }

    this._selectNodeId(id);
  }

  /**
   * Select node by id and cache wrapper element
   * @returns void
   */
  private _selectNodeId(id: string) {
    this.selectedNodeId = id;
    this.selectedElement = this.renderRoot.querySelector(
      `[data-node-id="${id}"]`,
    ) as HTMLElement | null;
    this.requestUpdate();
  }

  /**
   * Delete selected node (if any) and normalize order
   * @returns void
   */
  private _deleteSelectedNode() {
    const id = this.selectedNodeId;
    if (!id) return;

    const nodes = this._activeNodes().filter((n) => n.id !== id);
    this._clearSelection();

    // keep ordering sane in ordered modes
    if (this.layoutMode !== "freeform") {
      this._setActiveNodes(normalizeOrder(nodes));
    } else {
      this._setActiveNodes(nodes);
    }
  }

  /**
   * Blur any focused control inside this component
   * @returns void
   */
  private _blurActive() {
    const root = this.renderRoot as ShadowRoot;
    const ae = root.activeElement as HTMLElement | null;
    if (ae) ae.blur();

    const dae = this.ownerDocument.activeElement as HTMLElement | null;
    if (dae && dae !== this) dae.blur();
  }

  /* ===== Freeform drag-move ===== */

  /**
   * Detect interactive targets (don’t start drag on them)
   * @returns true if inside interactive element
   */
  private _isInteractiveTarget(target: EventTarget | null): boolean {
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
          // Shoelace interactive hosts
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

  /**
   * Detect interaction modifier keys (allow interaction if pressed)
   * @returns true if interaction key is pressed
   */
  private _allowInteract(e: MouseEvent): boolean {
    return e.ctrlKey || e.metaKey;
  }

  /**
   *
   * @returns true if focus is in an editable control inside this component
   */
  private _isEditingWithinComponent(): boolean {
    const root = this.renderRoot as ShadowRoot;
    const ae =
      (root.activeElement as HTMLElement | null) ??
      (this.ownerDocument.activeElement as HTMLElement | null);
    if (!ae) return false;

    // must be inside this component (shadow or light DOM)
    const path =
      typeof (ae as any).getRootNode === "function"
        ? (ae as any).getRootNode()
        : null;

    const inside =
      root.contains(ae) || (this.contains(ae) as boolean) || path === root;

    if (!inside) return false;

    // native + contenteditable
    if (ae.matches('input, textarea, select, [contenteditable="true"]'))
      return true;

    // Shoelace: focus may be host, or inside its shadow
    if (ae.closest("sl-input, sl-textarea, sl-select")) return true;

    return false;
  }

  /**
   * Freeform drag handler (mousemove updates node.pos, shift snaps)
   * @returns void
   */
  private _startFreeformDragFromPointer(e: PointerEvent, nodeId: string) {
    const el = this.renderRoot.querySelector(
      `[data-node-id="${nodeId}"]`,
    ) as HTMLElement | null;
    const canvas = this.renderRoot.querySelector(
      ".canvas",
    ) as HTMLElement | null;
    if (!el || !canvas) return;

    // capture pointer so we keep receiving moves
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}

    const rect = el.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const onMove = (ev: PointerEvent) => {
      const containerRect = canvas.getBoundingClientRect();
      let newX = ev.clientX - containerRect.left - offsetX;
      let newY = ev.clientY - containerRect.top - offsetY;

      if (this.shiftPressed) {
        newX = Math.round(newX / this.gridSize) * this.gridSize;
        newY = Math.round(newY / this.gridSize) * this.gridSize;
      }

      newX = Math.max(0, Math.min(newX, containerRect.width - el.offsetWidth));
      newY = Math.max(
        0,
        Math.min(newY, containerRect.height - el.offsetHeight),
      );

      this._setActiveNodes(
        this._activeNodes().map((n) =>
          n.id === nodeId ? { ...n, pos: { x: newX, y: newY } } : n,
        ),
      );
      this.requestUpdate();
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  /**
   * Click canvas background to clear selection
   * @returns void
   */
  private _onCanvasClick = (e: MouseEvent) => {
    this._blurActive();
    const path = e.composedPath() as EventTarget[];
    const clickedElement = path.find(
      (p) =>
        p instanceof HTMLElement && p.classList?.contains("builder-element"),
    ) as HTMLElement | undefined;

    if (!clickedElement) this._clearSelection();
  };

  /* ===== Layout mode switching ===== */

  /**
   * Switch layout mode; convert node data between freeform and ordered modes
   * @returns void
   */
  private _setLayoutMode(next: LayoutMode) {
    if (this.layoutMode === next) return;
    // one-time seed for converting between freeform and ordered modes: if switching to a mode that has no nodes but the other mode has nodes, convert those nodes to the new mode instead of starting with an empty canvas
    if (
      next !== "freeform" &&
      this.orderedNodes.length === 0 &&
      this.freeformNodes.length
    ) {
      this.orderedNodes = convertFreeformToOrdered(this.freeformNodes);
    }
    if (
      next === "freeform" &&
      this.freeformNodes.length === 0 &&
      this.orderedNodes.length
    ) {
      this.freeformNodes = convertOrderedToFreeform(this.orderedNodes);
    }
    this.layoutMode = next;
    this._clearSelection();
    this.requestUpdate();
  }

  /**
   * Clear selected node state
   * @returns void
   */
  private _clearSelection() {
    this.selectedNodeId = null;
    this.selectedElement = null;
    this.requestUpdate();
  }

  /* ===== Reset ===== */

  /**
   * Confirm reset dialog.
   * @returns Promise<void>
   */
  private async _confirmReset() {
    const confirmed = confirm(
      this.msg("This will remove all elements from the canvas. Continue?"),
    );
    if (confirmed) this._resetCanvas();
  }

  /**
   * Reset builder nodes + selection
   * @returns void
   */
  private _resetCanvas() {
    this._setActiveNodes([]);
    this._clearSelection();
    this.requestUpdate();
  }

  /* ===== Keyboard ===== */

  /**
   * Keydown: grid overlay (g), snapping (shift), arrow-move selected node
   * @returns void
   */
  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "g" || e.key === "G") {
      if (!this.gridKeyPressed) {
        this.gridKeyPressed = true;
        this.requestUpdate();
      }
    }

    if (e.key === "a" || e.key === "A") {
      this.interactKeyPressed = true;
      // optional: avoid typing "a" into inputs when testing interaction
      // e.preventDefault();
      return;
    }

    if (e.key === "Shift") this.shiftPressed = true;

    // delete selected node
    if (e.key === "Backspace" || e.key === "Delete") {
      if (this._isEditingWithinComponent()) return; // don’t delete while typing
      e.preventDefault();
      this._deleteSelectedNode();
      return;
    }

    if (this.layoutMode !== "freeform") return;
    const node = this._getSelectedNode();
    if (!node) return;

    const pos = node.pos ?? { x: 0, y: 0 };
    let { x, y } = pos;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        y -= 1;
        break;
      case "ArrowDown":
        e.preventDefault();

        y += 1;
        break;
      case "ArrowLeft":
        e.preventDefault();
        x -= 1;
        break;
      case "ArrowRight":
        e.preventDefault();
        x += 1;
        break;
      default:
        return;
    }

    this._updateNode(node.id, { pos: { x, y } });
  };

  /**
   * Keyup: release grid overlay (g) and snapping (shift)
   * @returns void
   */
  private _onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Shift") this.shiftPressed = false;

    if (e.key === "g" || e.key === "G") {
      this.gridKeyPressed = false;
      this.requestUpdate();
    }

    if (e.key === "a" || e.key === "A") {
      this.interactKeyPressed = false;
      return;
    }
  };

  // (optional helper)
  private _activeNodes(): BuilderNode[] {
    return this.layoutMode === "freeform"
      ? this.freeformNodes
      : this.orderedNodes;
  }
  private _setActiveNodes(next: BuilderNode[]) {
    if (this.layoutMode === "freeform") this.freeformNodes = next;
    else this.orderedNodes = next;
    this.requestUpdate();
  }
}
