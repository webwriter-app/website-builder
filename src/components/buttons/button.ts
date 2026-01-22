import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";
import "../../assets/shoelaceImports";

const DEFAULT_LABEL = "Button";
const DEFAULT_ICON = "";

export const ButtonComponent: BuilderComponent = {
  type: "button",
  label: "Button",
  group: "buttons",

  defaultData: {
    label: DEFAULT_LABEL,
    icon: DEFAULT_ICON,
  },

  render(data) {
    const label = data?.label || DEFAULT_LABEL;
    const icon = data?.icon || "";

    return html`
      <style>
        .btn-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          user-select: none;
        }

        .btn-wrap:hover {
          background: #f5f5f5;
        }

        sl-icon {
          font-size: 1.1em;
          pointer-events: none;
        }

        span {
          pointer-events: none;
        }
      </style>

      <button class="btn-wrap" type="button">
        ${icon ? html`<sl-icon name=${icon}></sl-icon>` : null}
        <span>${label}</span>
      </button>
    `;
  },

  bindings: [
    {
      key: "label",
      label: "Button text",
      kind: "text",
      target: "span",
      placeholder: "Button label",
    },
    {
      key: "icon",
      label: "Icon name (optional)",
      kind: "attr",
      target: "sl-icon",
      name: "name",
      placeholder: "alarm, heart, star…",
    },
  ],

  settings: ({ setData }) => {
    const reset = () => {
      setData({ label: DEFAULT_LABEL, icon: DEFAULT_ICON });
    };

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">Button</h2>

        <div class="setting-row">
          <sl-button size="small" variant="default" @click=${reset}>
            Reset button
          </sl-button>
        </div>

        <div class="setting-row" style="font-size: 0.8rem; color: #666;">
          Icons use Shoelace (Bootstrap Icons)
        </div>
      </div>
    `;
  },
};
