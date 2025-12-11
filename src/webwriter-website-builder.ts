import { html, css, LitElement, render } from "lit";
import { customElement } from "lit/decorators.js";
import LOCALIZE from "../localization/generated";
import { msg } from "@lit/localize";
import { wbBox, wbGear } from "./assets/icons";
import { ComponentRegistry } from "./components/registry";

import "@shoelace-style/shoelace/dist/components/details/details.js";
import "@shoelace-style/shoelace/dist/components/switch/switch.js";

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
    }

    .components {
      color: var(--sl-color-gray-600);
      font-size: var(--sl-font-size-medium);
      line-height: var(--sl-line-height-medium);
      font-weight: 400;
      margin: 0;
      padding: 0;
    }

    .components h2,
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

    .components hr {
      border: none;
      border-top: 1px solid var(--sl-color-neutral-200);
      margin: 0;
    }

    .components sl-details {
      margin-bottom: 1rem;
      border-bottom: 1px solid var(--sl-color-gray-300);
    }

    .components sl-details::part(base) {
      background-color: unset;
      border: none;
    }

    .components sl-option {
      padding: 0.4rem 0.5rem;
      border-radius: 0.3rem;
      font-size: 0.9rem;
      user-select: none;
    }

    .components sl-option:hover {
      background: var(--sl-color-neutral-200);
      cursor: grab;
    }

    .settings sl-switch {
      margin-left: 0.1em;
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

    .grid-overlay.hidden {
      display: none;
    }
  `;

  render() {
    const showGridOverlay = this.showGrid || this.gridKeyPressed;
    return html`
      <div class="layout">
        <!-- Sidebar -->
        <div part="options">
          <div class="components">
            <h2>
              <span style="display:inline-block; width:1.4rem; height:1.4rem;">
                ${wbBox}
              </span>
              ${msg("Components")}
            </h2>

            <hr />
            <sl-details summary=${msg("Text Components")}>
              <sl-details summary=${msg("Headings")}>
                ${["h1", "h2", "h3", "h4", "h5", "h6"].map(
                  (h) => html`
                    <sl-option
                      data-component-type="${h}"
                      draggable="true"
                      @dragstart=${this._onDragStart}
                      >${msg(h)}</sl-option
                    >
                  `
                )}
              </sl-details>
              ${["paragraph", "label"].map(
                (t) => html`
                  <sl-option
                    data-component-type="${t}"
                    draggable="true"
                    @dragstart=${this._onDragStart}
                    >${msg(t)}</sl-option
                  >
                `
              )}
            </sl-details>

            <sl-details summary=${msg("Media Components")}>
              ${["image", "video", "audio", "icon"].map(
                (t) => html`
                  <sl-option
                    data-component-type="${t}"
                    draggable="true"
                    @dragstart=${this._onDragStart}
                    >${msg(t)}</sl-option
                  >
                `
              )}
            </sl-details>

            <sl-details summary=${msg("Buttons & Links")}>
              ${["button", "link"].map(
                (t) => html`
                  <sl-option
                    data-component-type="${t}"
                    draggable="true"
                    @dragstart=${this._onDragStart}
                    >${msg(t)}</sl-option
                  >
                `
              )}
            </sl-details>

            <sl-details summary=${msg("Dividers")}>
              ${["divider", "spacer"].map(
                (t) => html`
                  <sl-option
                    data-component-type="${t}"
                    draggable="true"
                    @dragstart=${this._onDragStart}
                    >${msg(t)}</sl-option
                  >
                `
              )}
            </sl-details>
          </div>

          <div class="settings">
            <h2>${wbGear} ${msg("Settings")}</h2>
            <sl-switch
              .checked=${this.showGrid}
              @sl-change=${(e: CustomEvent) => {
                this.showGrid = e.detail.checked;
                this.requestUpdate();
              }}
              >Show Grid</sl-switch
            >
          </div>
        </div>

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
    `;
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
    wrapper.style.position = "absolute";
    wrapper.style.left = `${x}px`;
    wrapper.style.top = `${y}px`;
    wrapper.style.cursor = "grab";

    render(component.render(component.defaultData), wrapper);
    canvas.appendChild(wrapper);

    this._makeDraggable(wrapper, canvas);
  }

  _makeDraggable(element: HTMLElement, container: HTMLElement) {
    const EDGE_SIZE = 8; // px from border to allow dragging
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;

    const disableEditing = () => {
      element.setAttribute("contenteditable", "false");
    };
    const enableEditing = () => {
      element.setAttribute("contenteditable", "true");
    };

    element.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.selectedElement)
        this.selectedElement.classList.remove("selected");
      this.selectedElement = element;
      element.classList.add("selected");
      enableEditing(); // allow typing when clicking inside
    });

    const onMouseDown = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const onEdgeX = clickX <= EDGE_SIZE || clickX >= rect.width - EDGE_SIZE;
      const onEdgeY = clickY <= EDGE_SIZE || clickY >= rect.height - EDGE_SIZE;

      if (!onEdgeX && !onEdgeY) return;

      dragging = true;
      disableEditing(); // disable editing while dragging
      offsetX = clickX;
      offsetY = clickY;
      element.style.cursor = "grabbing";

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
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
      enableEditing(); // re-enable editing after drag ends
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    element.addEventListener("mousedown", onMouseDown);

    container.addEventListener("click", () => {
      if (this.selectedElement) {
        this.selectedElement.classList.remove("selected");
        this.selectedElement = null;
      }
    });
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
