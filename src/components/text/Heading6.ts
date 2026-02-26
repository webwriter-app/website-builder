import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading6: BuilderComponent = {
  type: "h1",
  label: "Heading 6",
  group: "text",

  render: (data) => html`
    <h6 style="margin: 0.5rem 0; display: inline-block; color: ${data.color ?? "#000000"}">
      ${data.content ?? "Heading 6"}
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
    {
      key: "color",
      label: "Text color",
      kind: "style",
      target: "h6",
      name: "color",
      placeholder: "#000000",
    },
  ],
};
