import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const LabelComponent: BuilderComponent = {
  type: "label",
  label: "Label",
  group: "text",

  render: () => html`
    <label style="margin: 0.5rem 0; display: inline-block"> Label </label>
  `,
  bindings: [
    {
      key: "content",
      label: "Label text",
      kind: "text",
      target: "label",
      placeholder: "Enter label text…",
    },
  ],
};
