import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const Divider: BuilderComponent = {
  type: "divider",
  label: "Divider",
  group: "dividers",

  render: () => html`
    <hr style="margin: 0.5rem 0; width: 1000px; display: inline-block">
  `
};

// settings: width