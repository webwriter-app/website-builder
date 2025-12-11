import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading1: BuilderComponent = {
  type: "h1",

  render: () => html`
    <h1 contenteditable="true" style="margin: 0.5rem 0;">
      Heading 1
    </h1>
  `
};
