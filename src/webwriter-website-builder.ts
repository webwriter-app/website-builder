import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import LOCALIZE from "../localization/generated";
import { msg } from "@lit/localize";
import { wbGear } from "./assets/icons";
import { ComponentRegistry } from "./components/registry";
import type { ComponentBinding } from "./types/BuilderComponent";
import "./assets/shoelaceImports.ts";

import { BuilderExporter } from "./builder/exporter";
import { normalizeOrder, sortedNodes, convertFreeformToOrdered, convertOrderedToFreeform } from "./builder/layout";
import { componentSyntaxHint, tileGlyph } from "./builder/palette-helpers";
import { parseBuilderState, serializeBuilderState } from "./builder/state-io";
import { builderStyles } from "./builder/styles";
import type { BuilderNode, FlexSettings, GridSettings, LayoutMode } from "./builder/types";
import { defaultFlexSettings, defaultGridSettings } from "./builder/types";

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

  // container settings (global)
  private flexSettings: FlexSettings = defaultFlexSettings();
  private gridSettings: GridSettings = defaultGridSettings();

  private exporter = new BuilderExporter();

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

  static styles = builderStyles;

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

            ${this._renderLayoutSettings()} ${this._renderSelectedComponentSettings()}
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
    return sortedNodes(this.nodes);
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
    return this.flexSettings;
  }

  private _setFlexSettings(patch: Partial<FlexSettings>) {
    this.flexSettings = { ...this._getFlexSettings(), ...patch };
    this.requestUpdate();
  }

  private _getGridSettings() {
    return this.gridSettings;
  }

  private _setGridSettings(patch: Partial<GridSettings>) {
    this.gridSettings = { ...this._getGridSettings(), ...patch };
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
    return serializeBuilderState({
      layoutMode: this.layoutMode,
      nodes: this.nodes,
      showGrid: this.showGrid,
      gridSize: this.gridSize,
      flexSettings: this._getFlexSettings(),
      gridSettings: this._getGridSettings(),
    });
  }

  private _applyState(serialized: string) {
    const parsed = parseBuilderState(serialized);
    if (!parsed) return;

    this.layoutMode = parsed.layoutMode;
    this.nodes = parsed.nodes;

    this.showGrid = parsed.showGrid;
    this.gridSize = parsed.gridSize;

    this.flexSettings = parsed.flexSettings;
    this.gridSettings = parsed.gridSettings;

    this._clearSelection();
  }

  /* ===== Code export (first version) ===== */

  private _generateExport(): { html: string; css: string; combined: string } {
    return this.exporter.generateExport({
      layoutMode: this.layoutMode,
      nodes: this.nodes,
      flexSettings: this._getFlexSettings(),
      gridSettings: this._getGridSettings(),
    });
  }

  /* ===== Info popup (unchanged) ===== */

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
    this.ownerDocument.removeEventListener("fullscreenchange", this._onFsChange);

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
    this.nodes = normalizeOrder(this.nodes);
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
    const canvas = this.renderRoot.querySelector(".canvas") as HTMLElement | null;
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
      newY = Math.max(0, Math.min(newY, containerRect.height - el.offsetHeight));

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
      (p) => p instanceof HTMLElement && p.classList?.contains("builder-element"),
    ) as HTMLElement | undefined;

    if (!clickedElement) this._clearSelection();
  };

  /* ===== Layout mode switching ===== */

  private _setLayoutMode(next: LayoutMode) {
    if (this.layoutMode === next) return;

    if (this.layoutMode === "freeform" && next !== "freeform") {
      this.nodes = convertFreeformToOrdered(this.nodes);
    }

    if (this.layoutMode !== "freeform" && next === "freeform") {
      this.nodes = convertOrderedToFreeform(this.nodes);
    }

    this.layoutMode = next;
    this.requestUpdate();
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
