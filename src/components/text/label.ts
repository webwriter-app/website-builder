import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const LabelComponent: BuilderComponent = {
  type: "label",

  render: () => html`
    <label
      contenteditable="true"
      style="margin: 0.5rem 0; display: inline-block"
    >
      Label
    </label>
  `,
};
