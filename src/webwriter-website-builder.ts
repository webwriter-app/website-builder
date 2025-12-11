import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import LOCALIZE from "../localization/generated";
import { msg } from "@lit/localize";

import { biGear } from "./assets/icons";


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

        <!-- Sidebar -->
        <div part="options">
          <h2> ${biGear} ${msg("Components")} </h2>
        </div>

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
