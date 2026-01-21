import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading6: BuilderComponent = {
  type: "h1",
  label: "Heading 6",
  group: "text",

  render: () => html`
    <h6 contenteditable="true" style="margin: 0.5rem 0; display: inline-block">
      Heading 6
    </h6>
  `,
  bindings: [
    {
      key: "content",
      label: "Heading text",
      kind: "text",
      target: "h6",
      placeholder: "Enter heading…",
    },
  ],
};
