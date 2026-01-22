import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
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

  @state() private _isFullscreen = false;

  // internal guard to avoid loops
  private _hydrating = false;
  private _lastSerialized = "";
  private _skipNextApplyFromWwState = false;

  // fullscreen + code panel
  private _codeTab: "html" | "css" | "combined" = "combined";

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

  // layout mode + nodes model
  private layoutMode: LayoutMode = "freeform";
  private nodes: BuilderNode[] = [];

  private _onFsChange = () => {
    this._isFullscreen = this.ownerDocument.fullscreenElement === this;
  };

  constructor() {
    super();
  }

  private async _toggleFullscreen() {
    const doc = this.ownerDocument;
    if (doc.fullscreenElement === this) {
      await doc.exitFullscreen();
    } else {
      await this.requestFullscreen();
    }
    // immediately sync; doc event will also fire
    this._isFullscreen = doc.fullscreenElement === this;
  }

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

    /* Make the widget fill the screen in fullscreen */
    :host(:fullscreen) {
      width: 100vw;
      height: 100vh;
      background: var(--sl-color-neutral-0);
    }

    .editor {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      min-width: 0;
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
      min-width: 0;
    }

    /* Fullscreen: split canvas + code panel */
    .layout.fullscreen-split {
      display: grid;
      grid-template-columns: minmax(360px, 1fr) minmax(320px, 520px);
      gap: 0.75rem;
      padding: 0.75rem;
      box-sizing: border-box;
    }

    .canvas {
      flex: 1;
      padding: 1rem;
      background: var(--sl-color-neutral-50);
      overflow: hidden;
      position: relative;
      min-width: 0;
      border-radius: 12px;
    }

    :host(:fullscreen) .canvas {
      background: var(--sl-color-neutral-0);
      border: 1px solid var(--sl-color-neutral-200);
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

    /* Hovering fullscreen button (bottom-right of canvas) */
    .fs-btn {
      position: absolute;
      right: 14px;
      bottom: 14px;
      z-index: 20;
      border-radius: 999px;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
    }
    .fs-btn sl-button::part(base) {
      border-radius: 999px;
    }

    /* Code panel (only shown in fullscreen) */
    .code-panel {
      background: var(--sl-color-neutral-0);
      border: 1px solid var(--sl-color-neutral-200);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100%;
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.5rem 0.6rem;
      border-bottom: 1px solid var(--sl-color-neutral-200);
      background: var(--sl-color-neutral-50);
    }

    .code-title {
      font-size: 0.8rem;
      color: var(--sl-color-neutral-700);
      font-weight: 600;
      white-space: nowrap;
    }

    .code-body {
      flex: 1;
      min-height: 0;
      overflow: auto;
      padding: 0.6rem;
      font-family:
        ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
        "Liberation Mono", "Courier New", monospace;
      font-size: 12px;
      line-height: 1.4;
      white-space: pre;
      background: var(--sl-color-neutral-0);
      user-select: text;
      margin: 0;
    }

    .code-body code {
      white-space: pre;
    }

    .code-tabs {
      display: flex;
      gap: 0.35rem;
      align-items: center;
      justify-content: flex-end;
    }

    .code-tab {
      border: 1px solid var(--sl-color-neutral-200);
      background: var(--sl-color-neutral-0);
      border-radius: 999px;
      padding: 0.2rem 0.55rem;
      font-size: 0.75rem;
      color: var(--sl-color-neutral-700);
      cursor: pointer;
      user-select: none;
    }

    .code-tab.active {
      border-color: var(--sl-color-primary-300);
      background: var(--sl-color-primary-50);
      color: var(--sl-color-primary-700);
    }
  `;

  render() {
    const showGridOverlay = this.showGrid || this.gridKeyPressed;

    // Only show code panel in fullscreen
    const split = this._isFullscreen;

    const { html: outHtml, css: outCss, combined } = this._generateExport();

    return html`
      <div class="layout ${split ? "fullscreen-split" : ""}">
        <!-- Sidebar (kept as-is; in fullscreen it becomes the left column wrapper) -->
        <div part="options" style=${split ? "display:none;" : ""}>
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

        <div class="editor" style=${split ? "height:100%;" : ""}>
          ${this._renderPalette()}

          <!-- Canvas -->
          <div
            class="canvas"
            @dragover=${this._onDragOver}
            @drop=${this._onDrop}
            style="--grid-size: ${this.gridSize}px"
            @click=${this._onCanvasClick}
          >
            ${showGridOverlay ? html`<div class="grid-overlay"></div>` : null}
            ${this._renderCanvasInner()}

            <!-- Hovering fullscreen button -->
            <div class="fs-btn">
              <sl-button
                size="small"
                variant="primary"
                @click=${this._toggleFullscreen}
                @mousedown=${(e: MouseEvent) => e.preventDefault()}
              >
                <sl-icon
                  name=${this._isFullscreen ? "fullscreen-exit" : "fullscreen"}
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

  /* ===== Selection + per-node settings ===== */

  private _renderSelectedComponentSettings() {
    const node = this._getSelectedNode();
    if (!node) return null;

    const component = ComponentRegistry[node.type];
    if (!component) return null;

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

  /* ===== State persistence ===== */

  private _serializeState(): string {
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

      const layoutMode = parsed.layoutMode as LayoutMode | undefined;
      const nodes = Array.isArray(parsed.nodes)
        ? (parsed.nodes as BuilderNode[])
        : [];

      this.layoutMode = layoutMode ?? "freeform";
      this.nodes = nodes;

      this.showGrid = Boolean(parsed.showGrid);
      this.gridSize = Number(parsed.gridSize ?? 20);

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

      this._clearSelection();
    } catch {
      // ignore invalid JSON
    }
  }

  /* ===== Code export (first version) ===== */

  private _escapeHtml(s: string) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  private _safeAttr(s: unknown) {
    if (s == null) return "";
    return String(s).replaceAll('"', "&quot;");
  }

  private _nodeToHtml(n: BuilderNode): string {
    const t = n.type;
    const d = n.data ?? {};

    // First version: map only the common primitives you already have.
    // Fallback: emit a comment so it's obvious something exists.
    switch (t) {
      case "h1": {
        const text = d.text ?? d.value ?? "Heading";
        return `<h1>${this._escapeHtml(String(text))}</h1>`;
      }
      case "paragraph": {
        const text = d.text ?? d.value ?? "Text…";
        return `<p>${this._escapeHtml(String(text))}</p>`;
      }
      case "image": {
        const src = d.src ?? "";
        const alt = d.alt ?? "";
        return `<img src="${this._safeAttr(src)}" alt="${this._escapeHtml(
          String(alt),
        )}">`;
      }
      case "video": {
        const src = d.src ?? "";
        return `<video src="${this._safeAttr(src)}" controls></video>`;
      }
      case "audio": {
        const src = d.src ?? "";
        return `<audio src="${this._safeAttr(src)}" controls></audio>`;
      }
      case "divider": {
        return `<hr>`;
      }
      case "link": {
        const href = d.href ?? "#";
        const label = d.label ?? "Link";
        return `<a href="${this._safeAttr(href)}" target="_blank" rel="noopener">${this._escapeHtml(
          String(label),
        )}</a>`;
      }
      case "button": {
        const label = d.label ?? "Button";
        return `<button type="button">${this._escapeHtml(String(label))}</button>`;
      }
      case "icon": {
        const name = d.name ?? "gear";
        return `<span class="icon" data-icon="${this._safeAttr(name)}"></span>`;
      }
      default:
        return `<!-- unsupported: ${t} -->`;
    }
  }

  private _indent(lines: string[], spaces = 2) {
    const pad = " ".repeat(spaces);
    return lines.map((l) => (l ? pad + l : l)).join("\n");
  }

  private _generateExport(): { html: string; css: string; combined: string } {
    const sorted = this._sortedNodes();

    const containerClass =
      this.layoutMode === "freeform"
        ? "page page--freeform"
        : this.layoutMode === "flex"
          ? "page page--flex"
          : this.layoutMode === "grid"
            ? "page page--grid"
            : "page page--flow";

    let bodyHtml = "";

    if (this.layoutMode === "freeform") {
      bodyHtml = sorted
        .map((n) => {
          const pos = n.pos ?? { x: 0, y: 0 };
          return `<div class="el" style="left:${Math.round(
            pos.x,
          )}px; top:${Math.round(pos.y)}px;">${this._nodeToHtml(n)}</div>`;
        })
        .join("\n");
    } else {
      bodyHtml = sorted
        .map((n) => {
          const display = n.display ?? "block";
          const cls = display === "inline" ? "el el--inline" : "el";
          return `<div class="${cls}">${this._nodeToHtml(n)}</div>`;
        })
        .join("\n");
    }

    const htmlLines = [
      `<!-- Generated by webwriter-website-builder -->`,
      `<div class="${containerClass}">`,
      this._indent(bodyHtml.split("\n"), 2),
      `</div>`,
    ];
    const htmlOut = htmlLines.join("\n");

    const flex = this._getFlexSettings();
    const grid = this._getGridSettings();

    const cssOut = `/* Generated by webwriter-website-builder */
    .page {
      box-sizing: border-box;
      padding: 16px;
      background: #fff;
      color: #0f172a;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    }

    .page img, .page video {
      max-width: 100%;
      height: auto;
    }

    .page--freeform {
      position: relative;
      min-height: 600px;
    }

    .page--freeform .el {
      position: absolute;
    }

    .page--flow .el--inline {
      display: inline-block;
    }

    .page--flex {
      display: flex;
      flex-direction: ${flex.direction ?? "row"};
      justify-content: ${flex.justify ?? "flex-start"};
      align-items: ${flex.align ?? "stretch"};
      flex-wrap: ${flex.wrap ?? "nowrap"};
      gap: ${flex.gap ?? "12px"};
    }

    .page--grid {
      display: grid;
      grid-template-columns: ${grid.columns ?? "repeat(3, 1fr)"};
      grid-auto-rows: ${grid.rows ?? "auto"};
      gap: ${grid.gap ?? "12px"};
    }

    /* Icons: placeholder representation */
    .page .icon::before {
      content: attr(data-icon);
      font-size: 12px;
      opacity: 0.7;
      border: 1px solid #e5e7eb;
      padding: 2px 6px;
      border-radius: 999px;
    }
    `;

    const combined = `<!-- HTML -->
    ${htmlOut}

    <style>
    ${cssOut}
    </style>`;

    return { html: htmlOut, css: cssOut, combined };
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

  /* ===== Global listeners ===== */

  connectedCallback() {
    super.connectedCallback();

    this.ownerDocument.addEventListener("fullscreenchange", this._onFsChange);
    this._isFullscreen = this.ownerDocument.fullscreenElement === this;

    this._hydrating = true;
    const attr = this.getAttribute("ww-state") || "";
    this._applyState(attr);
    this._hydrating = false;

    window.addEventListener("mousedown", this._onGlobalMouseDown);
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
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
    this.ownerDocument.removeEventListener(
      "fullscreenchange",
      this._onFsChange,
    );

    window.removeEventListener("mousedown", this._onGlobalMouseDown);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);

    super.disconnectedCallback();
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

    const target = e.target as HTMLElement | null;
    const anchor = target?.closest("a") as HTMLAnchorElement | null;
    const allowFollow =
      e instanceof MouseEvent && (e.metaKey || e.ctrlKey || e.altKey);
    if (anchor && !allowFollow) e.preventDefault();

    this._selectNodeId(id);
  }

  private _selectNodeId(id: string) {
    this.selectedNodeId = id;
    this.selectedElement = this.renderRoot.querySelector(
      `[data-node-id="${id}"]`,
    ) as HTMLElement | null;
    this.requestUpdate();
  }

  /* ===== Freeform drag-move ===== */

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

      this.nodes = this.nodes.map((n) =>
        n.id === nodeId ? { ...n, pos: { x: newX, y: newY } } : n,
      );
      this.requestUpdate();
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  private _onCanvasClick = (e: MouseEvent) => {
    const path = e.composedPath() as EventTarget[];
    const clickedElement = path.find(
      (p) =>
        p instanceof HTMLElement && p.classList?.contains("builder-element"),
    ) as HTMLElement | undefined;

    if (!clickedElement) this._clearSelection();
  };

  /* ===== Layout mode switching ===== */

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

  /* ===== Keyboard ===== */

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
