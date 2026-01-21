import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Link: BuilderComponent = {
  type: "link",
  label: "Link",
  group: "buttons",

  render: () => html`
    <a href="#" contenteditable="true" style="margin: 0.5rem 0; display: inline-block">
      Link
    </a>
  `
};