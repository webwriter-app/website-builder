import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const ParagraphComponent: BuilderComponent = {
  type: "paragraph",
  label: "Paragraph",
  group: "text",

  render: () => html` <p style="margin: 0.5rem 0;">Enter your text here…</p> `,
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
