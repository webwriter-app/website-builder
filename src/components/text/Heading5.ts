import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading5: BuilderComponent = {
  type: "h1",
  label: "Heading 5",
  group: "text",

  render: () => html`
    <h5 contenteditable="true" style="margin: 0.5rem 0; display: inline-block">
      Heading 5
    </h5>
  `
};
