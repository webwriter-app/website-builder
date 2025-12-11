import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading4: BuilderComponent = {
  type: "h1",

  render: () => html`
    <h4 contenteditable="true" style="margin: 0.5rem 0; display: inline-block">
      Heading 4
    </h4>
  `
};
