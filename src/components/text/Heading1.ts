import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading1: BuilderComponent = {
  type: "h1",
  label: "Heading 1",
  group: "text",

  render: () => html`
    <h1 style="margin: 0.5rem 0; display: inline-block">Heading 1</h1>
  `,

  bindings: [
    {
      key: "content",
      label: "Heading text",
      kind: "text",
      target: "h1",
      placeholder: "Enter heading…",
    },
  ],
};
