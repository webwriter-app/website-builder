import { html } from "lit";
import { msg } from "@lit/localize";
import type { BuilderComponent } from "../../types/BuilderComponent";
import "../../assets/shoelaceImports";

const DEFAULT_LABEL = "Button";
const DEFAULT_ICON = "";
const DEFAULT_ICON_COLOR = "#0f172a";
const DEFAULT_LABEL_COLOR = "#0f172a";

export const ButtonComponent: BuilderComponent = {
  type: "button",
  label: () => msg("Button"),
  group: "buttons",

  defaultData: {
    label: DEFAULT_LABEL,
    icon: DEFAULT_ICON,
    iconColor: DEFAULT_ICON_COLOR,
    labelColor: DEFAULT_LABEL_COLOR,
    borderless: false,
  },

  render(data) {
    const labelRaw = data?.label ?? DEFAULT_LABEL;
    const label = String(labelRaw);
    const hasLabel = label.trim().length > 0;

    const icon = data?.icon ?? DEFAULT_ICON;
    const hasIcon = !!icon;

    const iconColor = data?.iconColor ?? DEFAULT_ICON_COLOR;
    const labelColor = data?.labelColor ?? DEFAULT_LABEL_COLOR;
    const borderless = !!data?.borderless;

    return html`
      <style>
        .btn-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          user-select: none;
        }

        .btn-wrap.has-both {
          gap: 0.5rem;
        }

        .btn-wrap:hover {
          background: #f5f5f5;
        }

        .btn-wrap.borderless {
          padding: 0;
          border: none;
          background: transparent;
        }

        .btn-wrap.borderless:hover {
          background: transparent;
        }

        .btn-wrap sl-icon {
          font-size: 1.1em;
          pointer-events: none;
          color: var(--btn-icon-color, ${DEFAULT_ICON_COLOR});
        }

        .btn-wrap span {
          color: var(--btn-label-color, ${DEFAULT_LABEL_COLOR});
        }
      </style>

      <button
        class="btn-wrap
        ${hasIcon && hasLabel ? "has-both" : ""}
        ${borderless ? "borderless" : ""}"
        type="button"
        style="--btn-icon-color:${iconColor}; --btn-label-color:${labelColor};"
      >
        ${hasIcon ? html`<sl-icon name=${icon}></sl-icon>` : null}
        ${hasLabel ? html`<span>${label}</span>` : null}
      </button>
    `;
  },

  bindings: () => [
    {
      key: "label",
      label: msg("Button text"),
      kind: "text",
      target: "span",
      placeholder: msg("Button label"),
    },
  ],

  settings: ({ data, setData }) => {
    const icon = data?.icon ?? DEFAULT_ICON;
    const iconColor = data?.iconColor ?? DEFAULT_ICON_COLOR;
    const labelColor = data?.labelColor ?? DEFAULT_LABEL_COLOR;
    const borderless = !!data?.borderless;

    const reset = () => {
      setData({
        label: DEFAULT_LABEL,
        icon: DEFAULT_ICON,
        iconColor: DEFAULT_ICON_COLOR,
        labelColor: DEFAULT_LABEL_COLOR,
      });
    };

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">${msg("Button")}</h2>

        <div
          class="setting-row"
          style="display:flex; gap:0.5rem; align-items:center;"
        >
          <ww-icon-picker
            .value=${icon}
            .color=${iconColor}
            button-label=${msg("Pick icon…")}
            @ww-change=${(e: CustomEvent) =>
              setData({
                icon: e.detail?.name ?? "",
                iconColor: e.detail?.color ?? DEFAULT_ICON_COLOR,
              })}
          ></ww-icon-picker>

          <sl-button size="small" variant="default" @click=${reset}>
            ${msg("Reset button")}
          </sl-button>
        </div>

        <div class="setting-row">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <label style="font-size:0.85rem; color:var(--sl-color-neutral-700); flex-shrink:0;">
              ${msg("Text color")}
            </label>
            <input
              type="color"
              .value=${labelColor}
              @input=${(e: Event) =>
                setData({ labelColor: (e.target as HTMLInputElement).value })}
              style="
                width: 32px; height: 32px;
                border: 1px solid var(--sl-color-neutral-300);
                border-radius: 6px;
                padding: 2px;
                cursor: pointer;
                background: none;
              "
            />
            <sl-input
              size="small"
              placeholder="${DEFAULT_LABEL_COLOR}"
              .value=${labelColor}
              style="flex:1;"
              @sl-input=${(e: any) => {
                const val = String(e.target.value ?? "").trim();
                if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
                  setData({ labelColor: val });
                }
              }}
            ></sl-input>
          </div>
        </div>

        <div class="setting-row">
          <sl-switch
            .checked=${borderless}
            @sl-change=${(e: any) =>
              setData({ borderless: Boolean(e.target.checked) })}
          >
            ${msg("hide border")}
          </sl-switch>
        </div>
      </div>
    `;
  },
};