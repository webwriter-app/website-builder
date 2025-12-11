import { html, css, LitElement, render } from "lit";
import { customElement } from "lit/decorators.js";
import LOCALIZE from "../localization/generated";
import { msg } from "@lit/localize";
import { biGear } from "./assets/icons";
import { ComponentRegistry } from "./components/registry";

import "@shoelace-style/shoelace/dist/components/details/details.js";

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
          <h2>${biGear} ${msg("Components")}</h2>

          <hr />
          <sl-details summary=${msg("Text Components")}>
            <sl-option
              data-component-type="paragraph"
              draggable="true"
              @dragstart=${this._onDragStart}
              >${msg("Paragraph")}
            </sl-option>
            <sl-details summary=${msg("Headings")}>
              <sl-option
                data-component-type="h1"
                draggable="true"
                @dragstart=${this._onDragStart}
                >${msg("Heading 1")}</sl-option
              >
              <sl-option draggable="true" @dragstart=${this._onDragStart}
                >${msg("H2")}</sl-option
              >
              <sl-option draggable="true" @dragstart=${this._onDragStart}
                >${msg("H3")}</sl-option
              >
              <sl-option draggable="true" @dragstart=${this._onDragStart}
                >${msg("H4")}</sl-option
              >
              <sl-option draggable="true" @dragstart=${this._onDragStart}
                >${msg("H5")}</sl-option
              >
              <sl-option draggable="true" @dragstart=${this._onDragStart}
                >${msg("H6")}</sl-option
              >
            </sl-details>
            <sl-option draggable="true" @dragstart=${this._onDragStart}
              >${msg("Label/ Caption")}
            </sl-option>
          </sl-details>

          <sl-details summary=${msg("Media Components")}>
            <sl-option draggable="true" @dragstart=${this._onDragStart}
              >${msg("Image")}
            </sl-option>
            <sl-option draggable="true" @dragstart=${this._onDragStart}
              >${msg("Video")}
            </sl-option>
            <sl-option draggable="true" @dragstart=${this._onDragStart}
              >${msg("Audio")}
            </sl-option>
            <sl-option draggable="true" @dragstart=${this._onDragStart}
              >${msg("Icon")}
            </sl-option>
          </sl-details>

          <sl-details summary=${msg("Buttons & Links")}>
            <sl-option draggable="true" @dragstart=${this._onDragStart}
              >${msg("Button")}
            </sl-option>
            <sl-option draggable="true" @dragstart=${this._onDragStart}
              >${msg("Link")}
            </sl-option>
          </sl-details>

          <sl-details summary=${msg("Dividers")}>
            <sl-option draggable="true" @dragstart=${this._onDragStart}
              >${msg("Divider")}
            </sl-option>
            <sl-option draggable="true" @dragstart=${this._onDragStart}
              >${msg("Spacer")}
            </sl-option>
          </sl-details>
        </div>

        <!-- Canvas -->
        <div class="canvas" @dragover=${this._onDragOver} @drop=${this._onDrop}>
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

    const canvas = this.shadowRoot!.querySelector(".canvas")!;

    const placeholder = canvas.querySelector(".drop-zone");
    if (placeholder) placeholder.remove();

    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.classList.add("builder-element");
    wrapper.style.position = "relative";

    // Render actual lit template into the wrapper
    render(component.render(component.defaultData), wrapper);

    canvas.appendChild(wrapper);
  }
}
