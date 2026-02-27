import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";
import "../../assets/shoelaceImports";

const DEFAULT_LABEL = "Button";
const DEFAULT_ICON = ""; // empty = no icon
const DEFAULT_ICON_COLOR = "#0f172a";

export const ButtonComponent: BuilderComponent = {
  type: "button",
  label: "Button",
  group: "buttons",

  defaultData: {
    label: DEFAULT_LABEL,
    icon: DEFAULT_ICON,
    iconColor: DEFAULT_ICON_COLOR,
  },

  render(data) {
    const labelRaw = data?.label ?? DEFAULT_LABEL;
    const label = String(labelRaw); // ensure string
    const hasLabel = label.trim().length > 0;

    const icon = data?.icon ?? DEFAULT_ICON;
    const hasIcon = !!icon;

    const iconColor = data?.iconColor ?? DEFAULT_ICON_COLOR;

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

        /* gap only when we have both */
        .btn-wrap.has-both {
          gap: 0.5rem;
        }

        .btn-wrap:hover {
          background: #f5f5f5;
        }

        .btn-wrap sl-icon {
          font-size: 1.1em;
          pointer-events: none;
          color: var(--btn-icon-color, ${DEFAULT_ICON_COLOR});
        }

        .btn-wrap span {
          pointer-events: none;
        }
      </style>

      <button
        class="btn-wrap ${hasIcon && hasLabel ? "has-both" : ""}"
        type="button"
        style="--btn-icon-color:${iconColor};"
      >
        ${hasIcon ? html`<sl-icon name=${icon}></sl-icon>` : null}
        ${hasLabel ? html`<span>${label}</span>` : null}
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
  ],

  settings: ({ data, setData }) => {
    const icon = data?.icon ?? DEFAULT_ICON;
    const iconColor = data?.iconColor ?? DEFAULT_ICON_COLOR;

    const reset = () => {
      setData({
        label: DEFAULT_LABEL,
        icon: DEFAULT_ICON,
        iconColor: DEFAULT_ICON_COLOR,
      });
    };

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">Button</h2>

        <div
          class="setting-row"
          style="display:flex; gap:0.5rem; align-items:center;"
        >
          <ww-icon-picker
            .value=${icon}
            .color=${iconColor}
            button-label="Pick icon…"
            @ww-change=${(e: CustomEvent) =>
              setData({
                icon: e.detail?.name ?? "",
                iconColor: e.detail?.color ?? DEFAULT_ICON_COLOR,
              })}
          ></ww-icon-picker>

          <sl-button size="small" variant="default" @click=${reset}>
            Reset button
          </sl-button>
        </div>
      </div>
    `;
  },
};
