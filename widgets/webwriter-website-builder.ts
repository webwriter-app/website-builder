import { html, css, unsafeCSS, LitElement } from "lit"
import { LitElementWw } from "@webwriter/lit"
import { customElement } from "lit/decorators.js"
import LOCALIZE from '../localization/generated'
import { msg } from '@lit/localize'

@customElement("webwriter-website-builder")
export class WebwriterWebsiteBuilder extends LitElementWw {

  localize = LOCALIZE
  msg = msg

  /** Register the classes of custom elements to use in the Shadow DOM here.
   * @example
   * import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js"
   * ...
   *   static scopedElements = {"sl-button": SlButton}
   **/
  static scopedElements = {}

  /** Define your template here and return it. */
  render() {
    return html`
      <link rel="stylesheet" href="./webwriter-website-builder.css" />

      <div class="toolbar">
        <h2>Toolbar</h2>
        <div class="tool" draggable="true" @dragstart=${this._onDragStart}>Button</div>
        <div class="tool" draggable="true" @dragstart=${this._onDragStart}>Text</div>
        <div class="tool" draggable="true" @dragstart=${this._onDragStart}>Image</div>
      </div>

      <div
        class="canvas"
        @dragover=${this._onDragOver}
        @drop=${this._onDrop}
      >
        <div class="drop-zone">Drag components here</div>
      </div>
    `;
  }

  _onDragStart(event: DragEvent) {
    const target = event.target as HTMLElement;
    event.dataTransfer?.setData("text/plain", target.textContent || "");
  }

  _onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  _onDrop(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData("text/plain") || "";
    const canvas = this.shadowRoot!.querySelector(".canvas")!;

    const dropPlaceholder = canvas.querySelector(".drop-zone");
    if (dropPlaceholder) dropPlaceholder.remove();

    const newEl = document.createElement("div");
    newEl.textContent = data;
    newEl.style.padding = "0.5rem";
    newEl.style.marginBottom = "0.5rem";
    newEl.style.background = "#bdc3c7";
    newEl.style.borderRadius = "4px";
    canvas.appendChild(newEl);
  }
}