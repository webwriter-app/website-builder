import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Heading1: BuilderComponent = {
  type: "h1",
  label: "Heading 1",
  group: "text",
  
  render: (data) => html`
    <h1 style="margin: 0.5rem 0; display: inline-block; color: ${data.color ?? "#000000"}">${data.content ?? "Heading 1"}</h1>
  `,

  bindings: [
    {
      key: "content",
      label: "Heading text",
      kind: "text",
      target: "h1",
      placeholder: "Enter heading…",
    },
    {
      key: "color",
      label: "Text color",
      kind: "style",
      target: "h1",
      name: "color",
      placeholder: "#000000",
    }
  ],
};
