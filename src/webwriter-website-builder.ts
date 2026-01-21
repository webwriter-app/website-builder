import { html, css, LitElement, render } from "lit";
import { customElement } from "lit/decorators.js";
import LOCALIZE from "../localization/generated";
import { msg } from "@lit/localize";
import { wbGear } from "./assets/icons";
import { ComponentRegistry } from "./components/registry";
import type { ComponentBinding } from "./types/BuilderComponent";
import "./assets/shoelaceImports.ts";

@customElement("webwriter-website-builder")
export class WebwriterWebsiteBuilder extends LitElement {
  localize = LOCALIZE;
  msg = msg;
  selectedElement: HTMLElement | null = null;
  gridSize = 20; // pixels

  showGrid = false;
  shiftPressed = false;
  gridKeyPressed = false;

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

    .component-bar {
      display: flex;
      gap: 1.5rem;
      padding: 0.75rem 1rem;
      background: var(--sl-color-neutral-0);
      border-bottom: 1px solid var(--sl-color-neutral-200);
      overflow-x: auto;
    }

    .component-tabs {
      border-bottom: 1px solid var(--sl-color-neutral-200);
    }

    .component-button-row {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      flex-wrap: wrap;
    }

    .component-button-row sl-button {
      cursor: grab;
    }

    .component-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
    }

    .group-label {
      font-size: 0.8rem;
      color: var(--sl-color-neutral-600);
      margin-right: 0.25rem;
    }

    .component-bar sl-option {
      padding: 0.35rem 0.6rem;
      border-radius: 0.3rem;
      font-size: 0.85rem;
      cursor: grab;
    }

    .component-bar sl-option:hover {
      background: var(--sl-color-neutral-200);
    }

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
          ${this._renderComponentBar()}

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

  private _renderComponentBar() {
    return html`
      <sl-tab-group class="component-tabs" placement="top">
        <sl-tab slot="nav" panel="text">Text</sl-tab>
        <sl-tab slot="nav" panel="media">Media</sl-tab>
        <sl-tab slot="nav" panel="buttons">Buttons</sl-tab>
        <sl-tab slot="nav" panel="dividers">Dividers</sl-tab>

        <sl-tab-panel name="text">
          ${this._componentButtons([
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "paragraph",
            "label",
          ])}
        </sl-tab-panel>

        <sl-tab-panel name="media">
          ${this._componentButtons(["image", "video", "audio", "icon"])}
        </sl-tab-panel>

        <sl-tab-panel name="buttons">
          ${this._componentButtons(["button", "link"])}
        </sl-tab-panel>

        <sl-tab-panel name="dividers">
          ${this._componentButtons(["divider"])}
        </sl-tab-panel>
      </sl-tab-group>
    `;
  }

  private _componentButtons(types: string[]) {
    return html`
      <div class="component-button-row">
        ${types.map(
          (t) => html`
            <sl-button
              size="small"
              variant="default"
              draggable="true"
              data-component-type="${t}"
              @dragstart=${this._onDragStart}
            >
              ${msg(t)}
            </sl-button>
          `
        )}
      </div>
    `;
  }

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
    if (!sel) {
      // prefer first element child
      return (wrapper.firstElementChild as HTMLElement) ?? wrapper;
    }
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
    const EDGE_SIZE = 8; // px from border to allow resizing
    const DRAG_THRESHOLD = 5; // px movement to start drag
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let dragStarted = false;

    element.addEventListener("click", (e) => {
      e.stopPropagation();

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a") as HTMLAnchorElement | null;

      const allowFollow =
        e instanceof MouseEvent && (e.metaKey || e.ctrlKey || e.altKey);

      if (anchor && !allowFollow) {
        e.preventDefault();
      }

      if (this.selectedElement) {
        this.selectedElement.classList.remove("selected");
        this.selectedElement.setAttribute("contenteditable", "false");
      }

      this.selectedElement = element;
      element.classList.add("selected");
      this.requestUpdate();
    });

    const onMouseDown = (e: MouseEvent) => {
      // If click started on an interactive child, DO NOT DRAG
      if (this._isInteractiveTarget(e.target)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const rect = element.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      dragStarted = false;
      dragging = false;

      const onMouseMove = (e: MouseEvent) => {
        const deltaX = Math.abs(e.clientX - (rect.left + offsetX));
        const deltaY = Math.abs(e.clientY - (rect.top + offsetY));

        if (
          !dragStarted &&
          (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD)
        ) {
          dragStarted = true;
          dragging = true;
          element.style.cursor = "grabbing";
        }

        if (!dragging) return;

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
        dragging = false;
        element.style.cursor = "grab";

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    element.addEventListener("mousedown", onMouseDown);

    // Click outside to deselect
    container.addEventListener("click", (e) => {
      if (!this.selectedElement) return;

      // If click happened inside the selected element, do nothing
      if (e.target instanceof Node && this.selectedElement.contains(e.target)) {
        return;
      }

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

    if (confirmed) {
      this._resetCanvas();
    }
  }

  private _resetCanvas() {
    const canvas = this.renderRoot.querySelector(".canvas") as HTMLElement;
    if (!canvas) return;

    // Remove all placed components
    while (canvas.firstChild) {
      canvas.removeChild(canvas.firstChild);
    }

    // Reset internal state
    this.selectedElement = null;

    // Force re-render if any UI depends on selection
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
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
