import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

const DEFAULT_WIDTH = "300px";

export const DividerComponent: BuilderComponent = {
  type: "divider",
  label: "Divider",
  group: "dividers",

  defaultData: {
    width: DEFAULT_WIDTH,
  },

  render(data) {
    const width = data?.width || DEFAULT_WIDTH;

    return html`
      <style>
        .divider-wrap {
          display: inline-block;
          padding: 0.25rem 0;
          user-select: none;
        }

        hr {
          margin: 0;
          width: ${width};
          border: none;
          border-top: 1px solid #ccc;
        }
      </style>

      <div class="divider-wrap">
        <hr />
      </div>
    `;
  },

  // Sidebar → Content (simple, useful)
  bindings: [
    {
      key: "width",
      label: "Width (e.g. 300px, 60%, 20rem)",
      kind: "style",
      target: "hr",
      name: "width",
      placeholder: DEFAULT_WIDTH,
    },
  ],

  settings: ({ setData }) => {
    const reset = () => setData({ width: DEFAULT_WIDTH });

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">Divider</h2>

        <div class="setting-row">
          <sl-button size="small" variant="default" @click=${reset}>
            Reset width
          </sl-button>
        </div>
      </div>
    `;
  },
};
