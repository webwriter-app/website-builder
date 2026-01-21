import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading5: BuilderComponent = {
  type: "h1",
  label: "Heading 5",
  group: "text",

  render: () => html`
    <h5 style="margin: 0.5rem 0; display: inline-block">
      Heading 5
    </h5>
  `,
  bindings: [
    {
      key: "content",
      label: "Heading text",
      kind: "text",
      target: "h5",
      placeholder: "Enter heading…",
    },
  ],
};
