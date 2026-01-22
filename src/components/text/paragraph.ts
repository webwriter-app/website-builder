import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const ParagraphComponent: BuilderComponent = {
  type: "paragraph",
  label: "Paragraph",
  group: "text",

  render: (data) => html` <p style="margin: 0.5rem 0;">${data.content ?? "Enter your text here…"}</p> `,
  bindings: [
    {
      key: "content",
      label: "Paragraph text",
      kind: "text",
      target: "p",
      placeholder: "Enter paragraph text…",
    },
  ],
};
