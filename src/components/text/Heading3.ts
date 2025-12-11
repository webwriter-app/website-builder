import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading3: BuilderComponent = {
  type: "h1",

  render: () => html`
    <h3 contenteditable="true" style="margin: 0.5rem 0; display: inline-block">
      Heading 3
    </h3>
  `
};
