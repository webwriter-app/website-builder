import { html, css, LitElement, render } from "lit";
import { customElement } from "lit/decorators.js";
import LOCALIZE from "../localization/generated";
import { msg } from "@lit/localize";
import { wbGear } from "./assets/icons";
import { ComponentRegistry } from "./components/registry";
import type { ComponentBinding } from "./types/BuilderComponent";
import "./assets/shoelaceImports.ts";

type ComponentGroup = "all" | "text" | "media" | "buttons" | "dividers";

@customElement("webwriter-website-builder")
export class WebwriterWebsiteBuilder extends LitElement {
  localize = LOCALIZE;
  msg = msg;

  selectedElement: HTMLElement | null = null;
  gridSize = 20;

  showGrid = false;
  shiftPressed = false;
  gridKeyPressed = false;

  private componentQuery = "";
  private trayOpen = false;

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

  private activeGroup: ComponentGroup = "all";

  private suppressNextClick = false;

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
      max-height: 220px; /* keeps it compact */
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

    /* Simple slide animation */
    .tray[hidden] {
      display: none;
    }

    /* Shoelace-specific small polish */
    .palette-search sl-input::part(base) {
      border-radius: 999px;
      background: var(--sl-color-neutral-0);
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
      transition: background 120ms ease, color 120ms ease;
    }

    .seg-btn:hover {
      background: var(--sl-color-neutral-100);
    }

    .seg-btn.active {
      background: var(--sl-color-neutral-0);
      color: var(--sl-color-primary-700);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
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
      transition: transform 120ms ease, box-shadow 120ms ease,
        border-color 120ms ease, background 120ms ease;
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
      background-image: linear-gradient(
          to right,
          rgba(0, 0, 0, 0.1) 1px,
          transparent 1px
        ),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
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
                  this.showGrid = e.detail.checked;
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
            <div class="drop-zone">Drag and drop components here</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ===== New palette UI ===== */

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

          <!-- optional segmented group; can be removed to save space -->
          <div class="seg">
            ${this._segBtn("all", "All")} ${this._segBtn("text", "Text")}
            ${this._segBtn("media", "Media")}
            ${this._segBtn("buttons", "Buttons")}
            ${this._segBtn("dividers", "Dividers")}
          </div>
        </div>

        <!-- Only 1 row when not searching -->
        ${!searching
          ? html`
              <div class="quick-row" aria-label="Often used components">
                ${quick.map((t) => this._tile(t, { compact: true }))}
              </div>
            `
          : null}

        <!-- Slide-down tray when searching -->
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

        <!-- Info popup -->
        ${this._renderInfoPopup()}
      </div>
    `;
  }

  private _segBtn(group: ComponentGroup, label: string) {
    const active = this.activeGroup === group;
    return html`
      <button
        class="seg-btn ${active ? "active" : ""}"
        @click=${() => {
          this.activeGroup = group;
          this.requestUpdate();
        }}
        type="button"
      >
        ${label}
      </button>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("mousedown", this._onGlobalMouseDown);
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
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

    // Only close when clicking outside the palette (i.e., canvas/sidebar)
    if (!clickedInsidePalette && (this.trayOpen || this.infoForType)) {
      this.trayOpen = false;
      this.infoForType = null;
      this.infoAnchorEl = null;
      this.requestUpdate();
    }
  };

  private _renderInfoPopup() {
    if (!this.infoForType || !this.infoAnchorEl) return null;

    const comp = ComponentRegistry[this.infoForType];
    const label = comp?.label ?? this.infoForType;

    // placeholder for your future “code view”
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
    // Later: generate from registry or actual DOM serialization
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

  private _tile(type: string, opts: { compact: boolean }) {
    const comp = ComponentRegistry[type];
    const label = comp?.label ?? type;

    const onDragStart = (e: DragEvent) => {
      this.suppressNextClick = true;
      setTimeout(() => (this.suppressNextClick = false), 0);

      this._onDragStart(e);
      // close only after drag started
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
    // Small glyphs that read nicely in a 28px pill
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

  private _getPaletteItems(): string[] {
    const q = this.componentQuery.trim().toLowerCase();

    const allTypes = Object.keys(ComponentRegistry);

    // group filter
    const groupFiltered =
      this.activeGroup === "all"
        ? allTypes
        : allTypes.filter(
            (t) => ComponentRegistry[t]?.group === this.activeGroup
          );

    // search filter (type or label)
    const searched = q
      ? groupFiltered.filter((t) => {
          const comp = ComponentRegistry[t];
          const label = (comp?.label ?? t).toLowerCase();
          return t.toLowerCase().includes(q) || label.includes(q);
        })
      : groupFiltered;

    // stable ordering: group order then label
    return searched.sort((a, b) => {
      const la = (ComponentRegistry[a]?.label ?? a).toLowerCase();
      const lb = (ComponentRegistry[b]?.label ?? b).toLowerCase();
      return la.localeCompare(lb);
    });
  }

  private _quickAdd(type: string) {
    const component = ComponentRegistry[type];
    if (!component) return;

    const canvasEl = this.shadowRoot!.querySelector(".canvas");
    if (!(canvasEl instanceof HTMLElement)) return;
    const canvas = canvasEl;

    const placeholder = canvas.querySelector(".drop-zone");
    if (placeholder) placeholder.remove();

    // drop near top-left with a pleasant offset; feels intentional
    const x = 32;
    const y = 32;

    const wrapper = document.createElement("div");
    wrapper.classList.add("builder-element");
    wrapper.dataset.componentType = type;
    wrapper.style.position = "absolute";
    wrapper.style.left = `${x}px`;
    wrapper.style.top = `${y}px`;
    wrapper.style.cursor = "grab";

    render(component.render(component.defaultData), wrapper);
    canvas.appendChild(wrapper);

    this._makeDraggable(wrapper, canvas);

    // auto-select new element
    if (this.selectedElement) this.selectedElement.classList.remove("selected");
    this.selectedElement = wrapper;
    wrapper.classList.add("selected");
    this.requestUpdate();
  }

  /* ===== Existing selection/settings code unchanged ===== */

  private _renderSelectedComponentSettings() {
    if (!this.selectedElement) return null;

    const type = this.selectedElement.dataset.componentType;
    if (!type) return null;

    const component = ComponentRegistry[type];
    if (!component) return null;

    const custom = component.settings?.(this.selectedElement);

    const bindingsUI = component.bindings?.length
      ? html`
          <div style="margin-top: 1rem">
            <h2 style="margin-top: 0">${this.msg("Content")}</h2>

            ${component.bindings.map((b) => {
              const current = this._readBinding(this.selectedElement!, b);

              return html`
                <div class="setting-row">
                  <sl-input
                    label=${b.label}
                    .value=${current}
                    placeholder=${b.placeholder ?? ""}
                    @sl-input=${(e: CustomEvent) => {
                      const input = e.target as any;
                      this._writeBinding(
                        this.selectedElement!,
                        b,
                        input.value ?? ""
                      );
                    }}
                  ></sl-input>
                </div>
              `;
            })}
          </div>
        `
      : null;

    return html`
      <div style="margin-top: 1rem">${custom ?? null} ${bindingsUI}</div>
    `;
  }

  private _getBindingTarget(
    wrapper: HTMLElement,
    sel?: string
  ): HTMLElement | null {
    if (!sel) return (wrapper.firstElementChild as HTMLElement) ?? wrapper;
    return wrapper.querySelector(sel);
  }

  private _readBinding(wrapper: HTMLElement, b: ComponentBinding): string {
    const target = this._getBindingTarget(wrapper, b.target);
    if (!target) return "";

    switch (b.kind) {
      case "text":
        return target.textContent ?? "";
      case "html":
        return target.innerHTML ?? "";
      case "attr":
        return b.name ? target.getAttribute(b.name) ?? "" : "";
      case "style":
        return b.name ? target.style.getPropertyValue(b.name) ?? "" : "";
      default:
        return "";
    }
  }

  private _writeBinding(
    wrapper: HTMLElement,
    b: ComponentBinding,
    value: string
  ) {
    const target = this._getBindingTarget(wrapper, b.target);
    if (!target) return;

    switch (b.kind) {
      case "text":
        target.textContent = value;
        break;
      case "html":
        target.innerHTML = value;
        break;
      case "attr":
        if (!b.name) return;
        if (value === "") target.removeAttribute(b.name);
        else target.setAttribute(b.name, value);
        break;
      case "style":
        if (!b.name) return;
        target.style.setProperty(b.name, value);
        break;
    }
  }

  _onDragStart(event: DragEvent) {
    const target = event.target as HTMLElement;
    const type = target.getAttribute("data-component-type");
    event.dataTransfer?.setData("component-type", type ?? "");
  }

  _onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  _onDrop(event: DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer?.getData("component-type");
    if (!type) return;
    const component = ComponentRegistry[type];
    if (!component) return;

    const canvasEl = this.shadowRoot!.querySelector(".canvas");
    if (!(canvasEl instanceof HTMLElement)) return;
    const canvas = canvasEl;

    const placeholder = canvas.querySelector(".drop-zone");
    if (placeholder) placeholder.remove();

    const canvasRect = canvas.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;

    const wrapper = document.createElement("div");
    wrapper.classList.add("builder-element");
    wrapper.dataset.componentType = type;
    wrapper.style.position = "absolute";
    wrapper.style.left = `${x}px`;
    wrapper.style.top = `${y}px`;
    wrapper.style.cursor = "grab";

    render(component.render(component.defaultData), wrapper);
    canvas.appendChild(wrapper);

    this._makeDraggable(wrapper, canvas);
  }

  private _isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;

    return Boolean(
      target.closest(
        "a, input, textarea, button, select, sl-range, sl-button, sl-icon-button, audio, video, canvas"
      )
    );
  }

  _makeDraggable(element: HTMLElement, container: HTMLElement) {
    const DRAG_THRESHOLD = 5;
    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener("click", (e) => {
      e.stopPropagation();

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;
      const allowFollow =
        e instanceof MouseEvent && (e.metaKey || e.ctrlKey || e.altKey);

      if (anchor && !allowFollow) e.preventDefault();

      if (this.selectedElement) {
        this.selectedElement.classList.remove("selected");
        this.selectedElement.setAttribute("contenteditable", "false");
      }

      this.selectedElement = element;
      element.classList.add("selected");
      this.requestUpdate();
    });

    const onMouseDown = (e: MouseEvent) => {
      if (this._isInteractiveTarget(e.target)) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = element.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      const onMouseMove = (e: MouseEvent) => {
        const containerRect = container.getBoundingClientRect();
        let newX = e.clientX - containerRect.left - offsetX;
        let newY = e.clientY - containerRect.top - offsetY;

        if (this.shiftPressed) {
          newX = Math.round(newX / this.gridSize) * this.gridSize;
          newY = Math.round(newY / this.gridSize) * this.gridSize;
        }

        newX = Math.max(
          0,
          Math.min(newX, containerRect.width - element.offsetWidth)
        );
        newY = Math.max(
          0,
          Math.min(newY, containerRect.height - element.offsetHeight)
        );

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
      };

      const onMouseUp = () => {
        element.style.cursor = "grab";
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    element.addEventListener("mousedown", onMouseDown);

    container.addEventListener("click", (e) => {
      if (!this.selectedElement) return;

      if (e.target instanceof Node && this.selectedElement.contains(e.target))
        return;

      this.selectedElement.classList.remove("selected");
      this.selectedElement.setAttribute("contenteditable", "false");
      this.selectedElement = null;
      this.requestUpdate();
    });
  }

  private async _confirmReset() {
    const confirmed = confirm(
      this.msg("This will remove all elements from the canvas. Continue?")
    );
    if (confirmed) this._resetCanvas();
  }

  private _resetCanvas() {
    const canvas = this.renderRoot.querySelector(".canvas") as HTMLElement;
    if (!canvas) return;

    while (canvas.firstChild) canvas.removeChild(canvas.firstChild);

    this.selectedElement = null;
    this.requestUpdate();
  }

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "g" || e.key === "G") {
      if (!this.gridKeyPressed) {
        this.gridKeyPressed = true;
        this.requestUpdate();
      }
    }
    if (e.key === "Shift") this.shiftPressed = true;
    if (!this.selectedElement) return;

    let left = parseInt(this.selectedElement.style.left || "0", 10);
    let top = parseInt(this.selectedElement.style.top || "0", 10);

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        top -= 1;
        break;
      case "ArrowDown":
        e.preventDefault();
        top += 1;
        break;
      case "ArrowLeft":
        e.preventDefault();
        left -= 1;
        break;
      case "ArrowRight":
        e.preventDefault();
        left += 1;
        break;
    }

    this.selectedElement.style.left = `${left}px`;
    this.selectedElement.style.top = `${top}px`;
  };

  private _onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Shift") this.shiftPressed = false;
    if (e.key === "g" || e.key === "G") {
      this.gridKeyPressed = false;
      this.requestUpdate();
    }
  };
}
