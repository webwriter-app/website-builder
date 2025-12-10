import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import LOCALIZE from "../localization/generated";
import { msg } from "@lit/localize";

import "@shoelace-style/shoelace/dist/components/drawer/drawer.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";

@customElement("webwriter-website-builder")
export class WebwriterWebsiteBuilder extends LitElement {
  localize = LOCALIZE;
  msg = msg;

    static styles = css`
    :host {
      display: flex;
      width: 100%;
      height: 700px;
      overflow: hidden;
      background: var(--sl-color-neutral-0);
    }

    /* Drawer overlay doesn't block pointer events on canvas */
    sl-drawer::part(overlay) {
      pointer-events: none;
    }

    sl-drawer::part(panel) {
      pointer-events: auto;
    }

    .layout {
      display: flex;
      height: 100%;
      width: 100%;
      position: relative;
    }

    /* Drawer is contained within component */
    ::slotted(sl-drawer) {
      --size: 320px;
    }

    /* Sidebar toggle button */
    .sidebar-toggle {
      position: absolute;
      top: 1rem;
      left: 1rem;
      z-index: 10;
    }

    /* Canvas */
    .canvas {
      flex: 1;
      padding: 1rem;
      background: var(--sl-color-neutral-50);
      overflow: auto;
      position: relative;
    }

    .drop-zone {
      border: 2px dashed var(--sl-color-neutral-300);
      padding: 2rem;
      text-align: center;
      color: var(--sl-color-neutral-600);
      border-radius: 0.5rem;
      margin-top: 1rem;
    }

    .dropped-element {
      background: var(--sl-color-neutral-100);
      border: 1px solid var(--sl-color-neutral-300);
      border-radius: 0.5rem;
      padding: 0.75rem;
      margin-bottom: 0.75rem;
      font-family: sans-serif;
    }

    .tool-item {
      margin-bottom: 1rem;
      cursor: grab;
    }
  `;

  render() {
    return html`
      <div class="layout">

        <!-- Sidebar open button -->
        <sl-button
          class="sidebar-toggle"
          variant="primary"
          size="small"
          @click=${() => (this.shadowRoot!.querySelector("sl-drawer") as any).show()}
        >
          <sl-icon name="layout-sidebar"></sl-icon> Components
        </sl-button>

        <!-- Sidebar -->
        <sl-drawer label="Components" placement="start" style="--size: 320px;">
          <sl-card class="tool-item" draggable="true" @dragstart=${this._onDragStart}>
            <strong>Button</strong><br />
            A clickable button element.
          </sl-card>

          <sl-card class="tool-item" draggable="true" @dragstart=${this._onDragStart}>
            <strong>Text</strong><br />
            A basic text block.
          </sl-card>

          <sl-card class="tool-item" draggable="true" @dragstart=${this._onDragStart}>
            <strong>Image</strong><br />
            A placeholder image element.
          </sl-card>

          <sl-button slot="footer" variant="default" @click=${this._closeDrawer}>
            Close
          </sl-button>
        </sl-drawer>

        <!-- Canvas -->
        <div class="canvas" @dragover=${this._onDragOver} @drop=${this._onDrop}>
          <div class="drop-zone">Drag and drop components here</div>
        </div>
      </div>
    `;
  }

  _closeDrawer() {
    (this.shadowRoot!.querySelector("sl-drawer") as any).hide();
  }

  _onDragStart(event: DragEvent) {
    const target = event.target as HTMLElement;
    event.dataTransfer?.setData("text/plain", target.innerText.trim());
  }

  _onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  _onDrop(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData("text/plain") || "";
    const canvas = this.shadowRoot!.querySelector(".canvas")!;

    const placeholder = canvas.querySelector(".drop-zone");
    if (placeholder) placeholder.remove();

    const newEl = document.createElement("div");
    newEl.classList.add("dropped-element");
    newEl.textContent = data;
    canvas.appendChild(newEl);
  }
}
