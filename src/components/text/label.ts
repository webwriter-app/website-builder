import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const LabelComponent: BuilderComponent = {
  type: "label",
  label: "Label",
  group: "text",

  render: (data) => html`
    <label
      style="margin: 0.5rem 0; display: inline-block; color: ${data.color ??
      "#000000"}"
    >
      ${data.content ?? "Label"}
    </label>
  `,
  bindings: [
    {
      key: "content",
      label: "Label text",
      kind: "text",
      target: "label",
      placeholder: "Enter label text…",
    },
    {
      key: "color",
      label: "Text color",
      kind: "style",
      target: "label",
      name: "color",
      placeholder: "#000000",
    },
  ],
};
