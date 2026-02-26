import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading3: BuilderComponent = {
  type: "h1",
  label: "Heading 3",
  group: "text",

  render: (data) => html`
    <h3 style="margin: 0.5rem 0; display: inline-block; color: ${data.color ?? "#000000"}">
      ${data.content ?? "Heading 3"}
    </h3>
  `,
  bindings: [
    {
      key: "content",
      label: "Heading text",
      kind: "text",
      target: "h3",
      placeholder: "Enter heading…",
    },
    {
      key: "color",
      label: "Text color",
      kind: "style",
      target: "h3",
      name: "color",
      placeholder: "#000000",
    },
  ],
};
