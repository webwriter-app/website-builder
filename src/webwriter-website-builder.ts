import { html, css, LitElement, render } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import LOCALIZE from "../localization/generated";
import { msg } from "@lit/localize";
import { wbGear } from "./assets/icons";
import { ComponentRegistry } from "./components/registry";
import type { ComponentBinding } from "./types/BuilderComponent";
import "./assets/shoelaceImports.ts";

type LayoutMode = "freeform" | "flow" | "flex" | "grid";

type BuilderNode = {
  id: string;
  type: string;
  data: any;

  // freeform
  pos?: { x: number; y: number };

  // flow/flex/grid ordering & display
  order?: number;
  display?: "block" | "inline";

  // flex/grid (minimal foundation)
  flex?: {
    direction?: "row" | "column";
    justify?: string;
    align?: string;
    gap?: string;
    wrap?: "nowrap" | "wrap";
  };
  grid?: {
    columns?: string;
    rows?: string;
    gap?: string;
  };
};

@customElement("webwriter-website-builder")
export class WebwriterWebsiteBuilder extends LitElement {
  localize = LOCALIZE;
  msg = msg;

  // persistent state
  @property({ attribute: "ww-state" })
  accessor wwState: string = "";

  // internal guard to avoid loops
  private _hydrating = false;
  private _lastSerialized = "";
  private _skipNextApplyFromWwState = false;

  // selection
  selectedElement: HTMLElement | null = null;
  private selectedNodeId: string | null = null;

  // grid assist for freeform
  gridSize = 20;
  showGrid = false;
  shiftPressed = false;
  gridKeyPressed = false;

  // palette
  private componentQuery = "";
  private trayOpen = false;
  private suppressNextClick = false;

  private oftenUsed: string[] = [
    "h1",
    "paragraph",
    "image",
    "button",
    "link",
    "divider",
    "icon",
  ];

  private infoForType: string | null = null;
  private infoAnchorEl: HTMLElement | null = null;

  // NEW: layout mode + nodes model
  private layoutMode: LayoutMode = "freeform";
  private nodes: BuilderNode[] = [];

  static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 850px;
      overflow: hidden;
      background: var(--sl-color-neutral-0);
      padding: 0;
      margin: 0;
      position: relative;
    }

    .editor {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
    }

    /* Compact palette */
    .palette {
      background: var(--sl-color-neutral-0);
      border-bottom: 1px solid var(--sl-color-neutral-200);
      padding: 0.5rem 0.75rem 0.55rem 0.75rem;
      position: relative;
      z-index: 5;
    }

    .palette-top {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .palette-search {
      flex: 1;
      min-width: 220px;
    }

    .seg {
      display: inline-flex;
      padding: 0.15rem;
      border: 1px solid var(--sl-color-neutral-200);
      border-radius: 999px;
      background: var(--sl-color-neutral-50);
      gap: 0.15rem;
    }

    .seg-btn {
      border: 0;
      background: transparent;
      padding: 0.35rem 0.7rem;
      border-radius: 999px;
      font-size: 0.85rem;
      color: var(--sl-color-neutral-700);
      cursor: pointer;
      user-select: none;
      line-height: 1;
      white-space: nowrap;
      transition:
        background 120ms ease,
        color 120ms ease;
    }

    .seg-btn:hover {
      background: var(--sl-color-neutral-100);
    }

    .seg-btn.active {
      background: var(--sl-color-neutral-0);
      color: var(--sl-color-primary-700);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    }

    .quick-row {
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.45rem;
      overflow-x: auto;
      padding-bottom: 0.2rem;
    }

    .quick-row::-webkit-scrollbar {
      height: 6px;
    }
    .quick-row::-webkit-scrollbar-thumb {
      background: var(--sl-color-neutral-200);
      border-radius: 999px;
    }

    /* Slide-down tray */
    .tray {
      position: absolute;
      left: 0;
      right: 0;
      top: calc(100% + 1px);
      background: var(--sl-color-neutral-0);
      border-bottom: 1px solid var(--sl-color-neutral-200);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      border-radius: 0 0 14px 14px;
      overflow: hidden;
      transform-origin: top;
    }

    .tray-inner {
      max-height: 220px;
      overflow: auto;
      padding: 0.65rem;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
      gap: 0.55rem;
    }

    .tray-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 0.55rem 0.65rem;
      border-bottom: 1px solid var(--sl-color-neutral-200);
      background: var(--sl-color-neutral-50);
    }

    .tray-title {
      font-size: 0.8rem;
      color: var(--sl-color-neutral-600);
    }

    .tray-count {
      font-size: 0.75rem;
      color: var(--sl-color-neutral-500);
    }

    .tray[hidden] {
      display: none;
    }

    /* Shoelace-specific small polish */
    .palette-search sl-input::part(base) {
      border-radius: 999px;
      background: var(--sl-color-neutral-0);
    }

    .tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.65rem 0.5rem;
      border: 1px solid var(--sl-color-neutral-200);
      border-radius: 12px;
      background: var(--sl-color-neutral-0);
      cursor: grab;
      user-select: none;
      transition:
        transform 120ms ease,
        box-shadow 120ms ease,
        border-color 120ms ease,
        background 120ms ease;
    }

    .tile:hover {
      border-color: var(--sl-color-primary-200);
      background: var(--sl-color-primary-50);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    .tile:active {
      cursor: grabbing;
      transform: translateY(0px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
    }

    .tile-icon {
      width: 28px;
      height: 28px;
      border-radius: 10px;
      border: 1px solid var(--sl-color-neutral-200);
      background: var(--sl-color-neutral-50);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: var(--sl-color-neutral-700);
    }

    .tile-label {
      font-size: 0.78rem;
      color: var(--sl-color-neutral-800);
      text-align: center;
      line-height: 1.1;
    }

    /* ===== Existing UI ===== */
    .builder-element.selected {
      outline: 2px solid var(--sl-color-primary-600);
      outline-offset: 2px;
    }

    .settings h2 {
      font-size: var(--sl-button-font-size-medium);
      line-height: calc(
        var(--sl-input-height-medium) - var(--sl-input-border-width) * 2
      );
      font-weight: 500;
      margin-top: 0;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 1ch;
      border-bottom: 2px solid var(--sl-color-gray-600);
      color: var(--sl-color-gray-600);
    }

    .settings sl-switch {
      margin-left: 0.1em;
    }

    .setting-row {
      margin-top: 0.75rem;
    }

    .layout {
      display: flex;
      flex: 1;
      height: 100%;
    }

    .canvas {
      flex: 1;
      padding: 1rem;
      background: var(--sl-color-neutral-50);
      overflow: hidden;
      position: relative;
    }

    .drop-zone {
      border: 2px dashed var(--sl-color-neutral-300);
      text-align: center;
      color: var(--sl-color-neutral-600);
      border-radius: 0.5rem;
      margin: 1rem;
      height: 95%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .builder-element {
      user-select: none;
    }

    .grid-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      background-size: var(--grid-size, 20px) var(--grid-size, 20px);
      background-image:
        linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
    }

    /* NEW: roots for different layout modes */
    .freeform-root {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .flow-root {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 1rem;
      background: var(--sl-color-neutral-0);
      border-radius: 12px;
      border: 1px solid var(--sl-color-neutral-200);
    }

    .flow-item[data-display="inline"] {
      display: inline;
      margin: 0;
    }

    .flow-item[data-display="block"] {
      display: block;
      margin: 0.5rem 0;
    }

    .flex-root {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 1rem;
      background: var(--sl-color-neutral-0);
      border-radius: 12px;
      border: 1px solid var(--sl-color-neutral-200);
      display: flex;
    }

    .grid-root {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: auto;
      padding: 1rem;
      background: var(--sl-color-neutral-0);
      border-radius: 12px;
      border: 1px solid var(--sl-color-neutral-200);
      display: grid;
    }
  `;

  render() {
    const showGridOverlay = this.showGrid || this.gridKeyPressed;

    return html`
      <div class="layout">
        <!-- Sidebar -->
        <div part="options">
          <div class="settings">
            <h2>${wbGear} ${msg("Settings")}</h2>

            <div class="settings-row">
              <sl-switch
                .checked=${this.showGrid}
                @sl-change=${(e: CustomEvent) => {
                  this.showGrid = (e as any).detail.checked;
                  this.requestUpdate();
                }}
                >Show Grid</sl-switch
              >
            </div>

            <sl-divider style="--color: var(--sl-color-gray-600);"></sl-divider>

            <div class="settings-row">
              <sl-button
                size="small"
                variant="default"
                @click=${this._confirmReset}
                title=${this.msg("Reset canvas")}
                style="margin-left: auto;"
              >
                Reset Canvas
              </sl-button>
            </div>

            ${this._renderLayoutSettings()}
            ${this._renderSelectedComponentSettings()}
          </div>
        </div>

        <div class="editor">
          ${this._renderPalette()}

          <!-- Canvas -->
          <div
            class="canvas"
            @dragover=${this._onDragOver}
            @drop=${this._onDrop}
            style="--grid-size: ${this.gridSize}px"
          >
            ${showGridOverlay ? html`<div class="grid-overlay"></div>` : null}
            ${this._renderCanvasInner()}
          </div>
        </div>
      </div>
    `;
  }

  /* ===== Palette UI (remove group filtering, add layout tabs) ===== */

  private _renderPalette() {
    const q = this.componentQuery.trim();
    const searching = q.length > 0;

    const results = searching ? this._getPaletteItems() : [];
    const quick = this.oftenUsed.filter((t) => ComponentRegistry[t]);

    return html`
      <div class="palette">
        <div class="palette-top">
          <div class="palette-search">
            <sl-input
              size="small"
              clearable
              placeholder="Search components…"
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

          <!-- NEW: layout mode tabs -->
          <div class="seg" aria-label="Layout mode">
            ${this._layoutBtn("freeform", "Freeform")}
            ${this._layoutBtn("flow", "Flow")}
            ${this._layoutBtn("flex", "Flex")}
            ${this._layoutBtn("grid", "Grid")}
          </div>
        </div>

        ${!searching
          ? html`
              <div class="quick-row" aria-label="Often used components">
                ${quick.map((t) => this._tile(t, { compact: true }))}
              </div>
            `
          : null}

        <div class="tray" ?hidden=${!(this.trayOpen && searching)}>
          <div class="tray-header">
            <div class="tray-title">Results</div>
            <div class="tray-count">${results.length}</div>
          </div>

          <div class="tray-inner">
            <div class="results-grid">
              ${results.map((t) => this._tile(t, { compact: false }))}
            </div>
          </div>
        </div>

        ${this._renderInfoPopup()}
      </div>
    `;
  }

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

  private _getPaletteItems(): string[] {
    const q = this.componentQuery.trim().toLowerCase();
    const allTypes = Object.keys(ComponentRegistry);

    const searched = q
      ? allTypes.filter((t) => {
          const comp = ComponentRegistry[t];
          const label = (comp?.label ?? t).toLowerCase();
          return t.toLowerCase().includes(q) || label.includes(q);
        })
      : allTypes;

    return searched.sort((a, b) => {
      const la = (ComponentRegistry[a]?.label ?? a).toLowerCase();
      const lb = (ComponentRegistry[b]?.label ?? b).toLowerCase();
      return la.localeCompare(lb);
    });
  }

  /* ===== Canvas rendering per mode ===== */

  private _renderCanvasInner() {
    const empty = this.nodes.length === 0;

    if (empty) {
      return html`<div class="drop-zone">Drag and drop components here</div>`;
    }

    if (this.layoutMode === "freeform") {
      return html`
        <div class="freeform-root">
          ${repeat(
            this.nodes,
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

  private _sortedNodes() {
    return [...this.nodes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  private _renderNodeFreeform(n: BuilderNode) {
    const comp = ComponentRegistry[n.type];
    if (!comp) return null;

    const pos = n.pos ?? { x: 32, y: 32 };
    const selected = this.selectedNodeId === n.id;

    // wrapper is draggable only in freeform
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
        @click=${(e: MouseEvent) => this._selectNodeFromWrapper(e, n.id)}
        @mousedown=${(e: MouseEvent) => this._freeformMouseDown(e, n.id)}
      >
        ${comp.render(n.data ?? comp.defaultData)}
      </div>
    `;
  }

  private _renderNodeFlow(n: BuilderNode) {
    const comp = ComponentRegistry[n.type];
    if (!comp) return null;

    const selected = this.selectedNodeId === n.id;
    const display = n.display ?? "block";

    return html`
      <div
        class="builder-element flow-item ${selected ? "selected" : ""}"
        data-node-id=${n.id}
        data-component-type=${n.type}
        data-display=${display}
        @click=${(e: MouseEvent) => this._selectNodeFromWrapper(e, n.id)}
      >
        ${comp.render(n.data ?? comp.defaultData)}
      </div>
    `;
  }

  /* ===== Layout settings (global) ===== */

  private _renderLayoutSettings() {
    // Minimal controls to make flex/grid meaningful, without touching component registry
    if (this.layoutMode === "flex") {
      const flex = this._getFlexSettings();
      return html`
        <div style="margin-top: 1rem">
          <h2 style="margin-top: 0">${this.msg("Layout")}</h2>

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
          <h2 style="margin-top: 0">${this.msg("Layout")}</h2>

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

    // flow/freeform: no global layout settings needed
    return null;
  }

  private _flexContainerStyle(): string {
    const f = this._getFlexSettings();
    const direction = f.direction ?? "row";
    const justify = f.justify ?? "flex-start";
    const align = f.align ?? "stretch";
    const wrap = f.wrap ?? "nowrap";
    const gap = f.gap ?? "12px";
    return `flex-direction:${direction}; justify-content:${justify}; align-items:${align}; flex-wrap:${wrap}; gap:${gap};`;
  }

  private _gridContainerStyle(): string {
    const g = this._getGridSettings();
    const cols = g.columns ?? "repeat(3, 1fr)";
    const rows = g.rows ?? "auto";
    const gap = g.gap ?? "12px";
    return `grid-template-columns:${cols}; grid-auto-rows:${rows}; gap:${gap};`;
  }

  private _getFlexSettings() {
    // store on host for now (simple). You can persist later.
    const anyThis = this as any;
    anyThis._flexSettings ??= {
      direction: "row",
      justify: "flex-start",
      align: "stretch",
      gap: "12px",
      wrap: "nowrap",
    };
    return anyThis._flexSettings as NonNullable<BuilderNode["flex"]>;
  }

  private _setFlexSettings(patch: Partial<NonNullable<BuilderNode["flex"]>>) {
    const anyThis = this as any;
    anyThis._flexSettings = { ...this._getFlexSettings(), ...patch };
    this.requestUpdate();
  }

  private _getGridSettings() {
    const anyThis = this as any;
    anyThis._gridSettings ??= {
      columns: "repeat(3, 1fr)",
      rows: "auto",
      gap: "12px",
    };
    return anyThis._gridSettings as NonNullable<BuilderNode["grid"]>;
  }

  private _setGridSettings(patch: Partial<NonNullable<BuilderNode["grid"]>>) {
    const anyThis = this as any;
    anyThis._gridSettings = { ...this._getGridSettings(), ...patch };
    this.requestUpdate();
  }

  /* ===== Selection + per-node settings (bindings, plus flow display) ===== */

  private _renderSelectedComponentSettings() {
    const node = this._getSelectedNode();
    if (!node) return null;

    const component = ComponentRegistry[node.type];
    if (!component) return null;

    // existing custom settings callback still expects HTMLElement.
    // Since we now render from data, keep it optional: only call if we can find wrapper.
    const wrapperEl = this.renderRoot.querySelector(
      `[data-node-id="${node.id}"]`,
    ) as HTMLElement | null;

    const custom = component.settings
      ? component.settings({
          data: node.data ?? {},
          setData: (patch) => {
            this.nodes = this.nodes.map((n) =>
              n.id === node.id
                ? { ...n, data: { ...(n.data ?? {}), ...patch } }
                : n,
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

  private _getSelectedNode(): BuilderNode | null {
    if (!this.selectedNodeId) return null;
    return this.nodes.find((n) => n.id === this.selectedNodeId) ?? null;
  }

  private _updateNode(id: string, patch: Partial<BuilderNode>) {
    this.nodes = this.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n));
    this.requestUpdate();
  }

  private _readBindingFromNode(node: BuilderNode, b: ComponentBinding): string {
    const v = node.data?.[b.key];
    return v == null ? "" : String(v);
  }

  private _writeBindingToNode(id: string, b: ComponentBinding, value: string) {
    this.nodes = this.nodes.map((n) => {
      if (n.id !== id) return n;
      return { ...n, data: { ...(n.data ?? {}), [b.key]: value } };
    });
    this.requestUpdate();
  }

  private _serializeState(): string {
    // Only include what must be saved/restored.
    const payload = {
      layoutMode: this.layoutMode,
      nodes: this.nodes,
      showGrid: this.showGrid,
      gridSize: this.gridSize,
      flexSettings: this._getFlexSettings(),
      gridSettings: this._getGridSettings(),
    };

    return JSON.stringify(payload);
  }

  private _applyState(serialized: string) {
    if (!serialized) return;

    try {
      const parsed = JSON.parse(serialized);

      // basic validation / defaults
      const layoutMode = parsed.layoutMode as LayoutMode | undefined;
      const nodes = Array.isArray(parsed.nodes)
        ? (parsed.nodes as BuilderNode[])
        : [];

      this.layoutMode = layoutMode ?? "freeform";
      this.nodes = nodes;

      this.showGrid = Boolean(parsed.showGrid);
      this.gridSize = Number(parsed.gridSize ?? 20);

      // restore flex/grid settings
      if (parsed.flexSettings && typeof parsed.flexSettings === "object") {
        (this as any)._flexSettings = {
          ...this._getFlexSettings(),
          ...parsed.flexSettings,
        };
      }

      if (parsed.gridSettings && typeof parsed.gridSettings === "object") {
        (this as any)._gridSettings = {
          ...this._getGridSettings(),
          ...parsed.gridSettings,
        };
      }

      // selection is ephemeral – do NOT restore
      this._clearSelection();
    } catch {
      // ignore invalid JSON to avoid breaking widget
    }
  }

  /* ===== Info popup (unchanged) ===== */

  private _renderInfoPopup() {
    if (!this.infoForType || !this.infoAnchorEl) return null;

    const comp = ComponentRegistry[this.infoForType];
    const label = comp?.label ?? this.infoForType;

    const syntax = this._componentSyntaxHint(this.infoForType);

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

  private _componentSyntaxHint(type: string): string {
    switch (type) {
      case "h1":
        return `<h1>Heading</h1>`;
      case "paragraph":
        return `<p>Text…</p>`;
      case "image":
        return `<img src="…" alt="…">`;
      case "button":
        return `<button>Button</button>`;
      case "link":
        return `<a href="https://…">Link</a>`;
      case "divider":
        return `<hr />`;
      case "video":
        return `<video src="…" controls></video>`;
      case "audio":
        return `<audio src="…" controls></audio>`;
      case "icon":
        return `<sl-icon name="alarm"></sl-icon>`;
      default:
        return `<!-- ${type} -->`;
    }
  }

  /* ===== Tiles ===== */

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
        <div class="tile-icon">${this._tileGlyph(type)}</div>
        <div class="tile-label">${msg(label)}</div>
      </div>
    `;
  }

  private _tileGlyph(type: string): string {
    switch (type) {
      case "h1":
        return "H1";
      case "h2":
        return "H2";
      case "h3":
        return "H3";
      case "h4":
        return "H4";
      case "h5":
        return "H5";
      case "h6":
        return "H6";
      case "paragraph":
        return "¶";
      case "label":
        return "T";
      case "image":
        return "🖼";
      case "video":
        return "▶";
      case "audio":
        return "♪";
      case "icon":
        return "★";
      case "button":
        return "▢";
      case "link":
        return "↗";
      case "divider":
        return "—";
      default:
        return type.slice(0, 2).toUpperCase();
    }
  }

  /* ===== Global listeners (keep, but simplify) ===== */

  connectedCallback() {
    super.connectedCallback();

    // hydrate once from attribute (important for initial render)
    this._hydrating = true;
    const attr = this.getAttribute("ww-state") || "";
    // prefer attribute as source of truth on boot
    this._applyState(attr);
    this._hydrating = false;

    window.addEventListener("mousedown", this._onGlobalMouseDown);
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }

  updated(changed: Map<string, unknown>) {
    super.updated(changed);

    // 1) If wwState changed, only apply when it is EXTERNAL (e.g. WebWriter reparse)
    if (changed.has("wwState")) {
      if (this._skipNextApplyFromWwState) {
        this._skipNextApplyFromWwState = false;
      } else if (!this._hydrating) {
        this._hydrating = true;
        this._applyState(this.wwState);
        this._hydrating = false;
      }
    }

    // 2) Persist internal state → attribute (for save + undo/redo)
    if (!this._hydrating) {
      const next = this._serializeState();

      if (next !== this._lastSerialized) {
        this._lastSerialized = next;

        // IMPORTANT: prevent the next wwState-change from re-applying + clearing selection
        this._skipNextApplyFromWwState = true;

        // Write attribute directly so WebWriter "Edit source" sees it
        this.setAttribute("ww-state", next);

        // keep property in sync too (optional but nice)
        this.wwState = next;
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("mousedown", this._onGlobalMouseDown);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
  }

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

  private _onDragStart(event: DragEvent) {
    const target = event.target as HTMLElement;
    const type = target.getAttribute("data-component-type");
    event.dataTransfer?.setData("component-type", type ?? "");
  }

  private _onDragOver(event: DragEvent) {
    event.preventDefault();
  }

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

    // flow/flex/grid: insert by mouse position (top-down)
    this._dropFlowLike(event, type);
  }

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
      order: this.nodes.length,
      display: "block",
    };

    this.nodes = [...this.nodes, node];
    this._selectNodeId(node.id);
  }

  private _dropFlowLike(event: DragEvent, type: string) {
    const root = this.renderRoot.querySelector(
      this.layoutMode === "flow"
        ? ".flow-root"
        : this.layoutMode === "flex"
          ? ".flex-root"
          : ".grid-root",
    ) as HTMLElement | null;

    // If empty, root may not exist yet (drop-zone showing)
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

    const next = [...this.nodes];
    // insert according to sorted order; easiest: sort first, splice, then normalize
    const sorted = this._sortedNodes();
    sorted.splice(insertIndex, 0, node);
    this.nodes = sorted;
    this._normalizeOrder();

    this._selectNodeId(node.id);
  }

  private _normalizeOrder() {
    this.nodes = this.nodes.map((n, i) => ({ ...n, order: i }));
  }

  private _quickAdd(type: string) {
    const component = ComponentRegistry[type];
    if (!component) return;

    if (this.layoutMode === "freeform") {
      const node: BuilderNode = {
        id: crypto.randomUUID(),
        type,
        data: structuredClone(component.defaultData ?? {}),
        pos: { x: 32, y: 32 },
        order: this.nodes.length,
        display: "block",
      };
      this.nodes = [...this.nodes, node];
      this._selectNodeId(node.id);
      return;
    }

    const node: BuilderNode = {
      id: crypto.randomUUID(),
      type,
      data: structuredClone(component.defaultData ?? {}),
      order: this.nodes.length,
      display: "block",
    };
    this.nodes = [...this.nodes, node];
    this._normalizeOrder();
    this._selectNodeId(node.id);
  }

  /* ===== Selection helpers ===== */

  private _selectNodeFromWrapper(e: MouseEvent, id: string) {
    e.stopPropagation();

    // prevent following links unless modifier (keeps your old behavior idea)
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest("a") as HTMLAnchorElement | null;
    const allowFollow =
      e instanceof MouseEvent && (e.metaKey || e.ctrlKey || e.altKey);
    if (anchor && !allowFollow) e.preventDefault();

    this._selectNodeId(id);
  }

  private _selectNodeId(id: string) {
    this.selectedNodeId = id;
    // maintain selectedElement for minimal compatibility with your code
    this.selectedElement = this.renderRoot.querySelector(
      `[data-node-id="${id}"]`,
    ) as HTMLElement | null;
    this.requestUpdate();
  }

  /* ===== Freeform drag-move (replaces _makeDraggable) ===== */

  private _isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        "a, input, textarea, button, select, sl-range, sl-button, sl-icon-button, audio, video, canvas",
      ),
    );
  }

  private _freeformMouseDown(e: MouseEvent, nodeId: string) {
    if (this.layoutMode !== "freeform") return;
    if (this._isInteractiveTarget(e.target)) return;

    e.preventDefault();
    e.stopPropagation();

    const el = this.renderRoot.querySelector(
      `[data-node-id="${nodeId}"]`,
    ) as HTMLElement | null;
    const canvas = this.renderRoot.querySelector(
      ".canvas",
    ) as HTMLElement | null;
    if (!el || !canvas) return;

    const rect = el.getBoundingClientRect();
    let offsetX = e.clientX - rect.left;
    let offsetY = e.clientY - rect.top;

    const onMove = (ev: MouseEvent) => {
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

      // update model (source of truth)
      this.nodes = this.nodes.map((n) =>
        n.id === nodeId ? { ...n, pos: { x: newX, y: newY } } : n,
      );
      // no requestUpdate spam; style is bound to render. Lit will batch.
      this.requestUpdate();
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  /* ===== Layout mode switching (basic conversions) ===== */

  private _setLayoutMode(next: LayoutMode) {
    if (this.layoutMode === next) return;

    if (this.layoutMode === "freeform" && next !== "freeform") {
      this._convertFreeformToOrdered();
    }

    if (this.layoutMode !== "freeform" && next === "freeform") {
      this._convertOrderedToFreeform();
    }

    this.layoutMode = next;
    this.requestUpdate();
  }

  private _convertFreeformToOrdered() {
    const withPos = this.nodes.map((n) => ({
      ...n,
      pos: n.pos ?? { x: 0, y: 0 },
      display: n.display ?? "block",
    }));

    withPos.sort((a, b) => a.pos!.y - b.pos!.y || a.pos!.x - b.pos!.x);

    this.nodes = withPos.map((n, i) => ({ ...n, order: i }));
    this._clearSelection();
  }

  private _convertOrderedToFreeform() {
    const sorted = this._sortedNodes();
    let y = 32;
    const x = 32;

    this.nodes = sorted.map((n) => {
      const pos = n.pos ?? { x, y };
      y += 80;
      return { ...n, pos };
    });

    this._clearSelection();
  }

  private _clearSelection() {
    this.selectedNodeId = null;
    this.selectedElement = null;
  }

  /* ===== Reset ===== */

  private async _confirmReset() {
    const confirmed = confirm(
      this.msg("This will remove all elements from the canvas. Continue?"),
    );
    if (confirmed) this._resetCanvas();
  }

  private _resetCanvas() {
    this.nodes = [];
    this._clearSelection();
    this.requestUpdate();
  }

  /* ===== Keyboard (freeform arrow move only) ===== */

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "g" || e.key === "G") {
      if (!this.gridKeyPressed) {
        this.gridKeyPressed = true;
        this.requestUpdate();
      }
    }
    if (e.key === "Shift") this.shiftPressed = true;

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

  private _onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Shift") this.shiftPressed = false;
    if (e.key === "g" || e.key === "G") {
      this.gridKeyPressed = false;
      this.requestUpdate();
    }
  };
}
