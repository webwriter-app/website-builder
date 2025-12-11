import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading2: BuilderComponent = {
  type: "h1",

  render: () => html`
    <h2 contenteditable="true" style="margin: 0.5rem 0; display: inline-block">
      Heading 2
    </h2>
  `
};
