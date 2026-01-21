import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Button: BuilderComponent = {
  type: "button",
  label: "Button",
  group: "buttons",

  render: () => html`
    <button contenteditable="true" style="margin: 0.5rem 0; display: inline-block">
      Button
    </button>
  `
};