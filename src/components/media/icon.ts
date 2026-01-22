import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";
import "../../assets/shoelaceImports";

const DEFAULT_ICON = "gear";
const DEFAULT_COLOR = "#0f172a";

export const IconComponent: BuilderComponent = {
  type: "icon",
  label: "Icon",
  group: "media",

  defaultData: {
    name: DEFAULT_ICON,
    size: "32px",
    color: DEFAULT_COLOR,
  },

  render(data) {
    const name = data?.name || DEFAULT_ICON;
    const size = data?.size || "32px";
    const color = data?.color || DEFAULT_COLOR;

    return html`
      <style>
        .icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 6px;
          user-select: none;
        }

        sl-icon {
          font-size: ${size};
          color: ${color};
          pointer-events: none;
        }
      </style>

      <div class="icon-wrap">
        <sl-icon name=${name}></sl-icon>
      </div>
    `;
  },

  // Generic editable fields in the Content section
  bindings: [
    {
      key: "name",
      label: "Icon name",
      kind: "attr",
      target: "sl-icon",
      name: "name",
      placeholder: "e.g. gear, heart, star, camera…",
    },
    {
      key: "size",
      label: "Icon size (e.g. 24px, 2rem)",
      kind: "style",
      target: "sl-icon",
      name: "font-size",
      placeholder: "32px",
    },
    {
      key: "color",
      label: "Icon color",
      kind: "style",
      target: "sl-icon",
      name: "color",
      placeholder: "currentColor, #000, red…",
    },
  ],

  // Optional helper UI
  settings: ({ setData }) => {
    const resetIcon = () => {
      setData({ name: DEFAULT_ICON, size: "32px", color: DEFAULT_COLOR });
    };

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">Icon</h2>

        <div class="setting-row">
          <sl-button size="small" variant="default" @click=${resetIcon}>
            Reset to default
          </sl-button>
        </div>

        <div class="setting-row" style="font-size: 0.8rem; color: #666;">
          Icons are from Shoelace. See: https://shoelace.style/components/icon
        </div>
      </div>
    `;
  },
};
