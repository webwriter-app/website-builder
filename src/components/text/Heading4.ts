import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading4: BuilderComponent = {
  type: "h1",
  label: "Heading 4",
  group: "text",

  render: (data) => html`
    <h4 style="margin: 0.5rem 0; display: inline-block; color: ${data.color ?? "#000000"}">
      ${data.content ?? "Heading 4"}
    </h4>
  `,
  bindings: [
    {
      key: "content",
      label: "Heading text",
      kind: "text",
      target: "h4",
      placeholder: "Enter heading…",
    },
    {
      key: "color",
      label: "Text color",
      kind: "style",
      target: "h4",
      name: "color",
      placeholder: "#000000",
    },
  ],
};
