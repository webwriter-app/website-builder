import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const ParagraphComponent: BuilderComponent = {
  type: "paragraph",
  label: "Paragraph",
  group: "text",
  
  render: () => html`
    <p contenteditable="true" style="margin: 0.5rem 0;">
      Enter your text here…
    </p>
  `,
};
