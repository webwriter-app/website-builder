import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading2: BuilderComponent = {
  type: "h1",
  label: "Heading 2",
  group: "text",

  render: (data) => html`
    <h2 style="margin: 0.5rem 0; display: inline-block; color: ${data.color ?? "#000000"}">
      ${data.content ?? "Heading 2"}
    </h2>
  `,

  bindings: [
    {
      key: "content",
      label: "Heading text",
      kind: "text",
      target: "h2",
      placeholder: "Enter heading…",
    },
    {
      key: "color",
      label: "Text color",
      kind: "style",
      target: "h2",
      name: "color",
      placeholder: "#000000",
    },
  ],
};
