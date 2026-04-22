import { html } from "lit";
import { msg } from "@lit/localize";
import type { BuilderComponent } from "../../types/BuilderComponent";

const DEFAULT_WIDTH = "300px";
const DEFAULT_HEIGHT = "1px";

export const DividerComponent: BuilderComponent = {
  type: "divider",
  label: () => msg("Divider"),
  group: "dividers",

  defaultData: {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },

  render(data) {
    const width = data?.width || DEFAULT_WIDTH;
    const height = data?.height || DEFAULT_HEIGHT;

    return html`
      <div
        style="
          display: inline-block;
          padding: 0.25rem 0;
          user-select: none;
          width: ${width};
        "
      >
        <hr
          style="
            margin: 0;
            width: 100%;
            border: none;
            border-top: ${height} solid #ccc;
          "
        />
      </div>
    `;
  },

  bindings: () => [
    {
      key: "width",
      label: msg("Width (e.g. 300px, 20rem)"),
      kind: "style",
      target: "hr",
      name: "width",
      placeholder: DEFAULT_WIDTH,
    },
    {
      key: "height",
      label: msg("Height (e.g. 10px, 0.5rem)"),
      kind: "style",
      target: "hr",
      name: "height",
      placeholder: DEFAULT_HEIGHT,
    },
  ],

  settings: ({ setData }) => {
    const reset = () => setData({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">${msg("Divider")}</h2>
        <div class="setting-row">
          <sl-button size="small" variant="default" @click=${reset}>
            ${msg("Reset width and height")}
          </sl-button>
        </div>
      </div>
    `;
  },
};