// Usage in IconComponent (src/builder/components/media/icon.ts)
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

  settings: ({ data, setData }) => {
    const name = data?.name ?? DEFAULT_ICON;
    const size = data?.size ?? "32px";
    const color = data?.color ?? DEFAULT_COLOR;

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">Icon</h2>

        <div class="setting-row">
          <ww-icon-picker
            .value=${name}
            .color=${color}
            button-label="Pick icon…"
            @ww-change=${(e: CustomEvent) =>
              setData({ name: e.detail.name, color: e.detail.color })}
          ></ww-icon-picker>
        </div>

        <div class="setting-row">
          <sl-input
            label="Size"
            placeholder="32px"
            .value=${String(size)}
            @sl-input=${(e: any) =>
              setData({ size: String(e.target.value ?? "") })}
          ></sl-input>
        </div>

        <div class="setting-row">
          <sl-input
            label="Color"
            placeholder="#0f172a"
            .value=${String(color)}
            @sl-input=${(e: any) =>
              setData({ color: String(e.target.value ?? "") })}
          ></sl-input>
        </div>
      </div>
    `;
  },
};
