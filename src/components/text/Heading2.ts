import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading2: BuilderComponent = {
  type: "h1",
  label: "Heading 2",
  group: "text",

  render: () => html`
    <h2 style="margin: 0.5rem 0; display: inline-block">Heading 2</h2>
  `,

  bindings: [
    {
      key: "content",
      label: "Heading text",
      kind: "text",
      target: "h2",
      placeholder: "Enter heading…",
    },
  ],
};
