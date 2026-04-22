import { html } from "lit";
import { msg } from "@lit/localize";
import type { BuilderComponent } from "../../types/BuilderComponent";
import { FONT_OPTIONS } from "../../builder/data/data";

const DEFAULT_FONT =
  "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";

const DEFAULT_WIDTH = "320px";
const DEFAULT_HEIGHT = "40px";

export const TextareaComponent: BuilderComponent = {
  type: "textarea",
  label: () => msg("Textarea"),
  group: "text",

  defaultData: {
    font: DEFAULT_FONT,
    color: "#000000",
    placeholder: msg("Enter text…"),
    "font-weight": "normal",
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    "font-size": "1em",
  },

  render: (data) => {
    const font =
      typeof data?.font === "string" && data.font.trim()
        ? data.font
        : DEFAULT_FONT;

    const color = data?.color ?? "#000000";
    const placeholder = data?.placeholder ?? msg("Enter text…");
    const fontWeight = data?.["font-weight"] ?? "normal";
    const width = data?.width ?? DEFAULT_WIDTH;
    const height = data?.height ?? DEFAULT_HEIGHT;
    const fontSize = data?.["font-size"] ?? "1em";

    return html`
      <style>
        sl-textarea {
          width: ${width};
          height: ${height};
        }

        sl-textarea::part(textarea) {
          min-height: 0 !important;
          height: ${height} !important;
          box-sizing: border-box;
        }

        sl-textarea::part(base) {
          min-height: 0 !important;
        }
      </style>

      <sl-textarea
        placeholder=${placeholder}
        style="
      margin: 0.5rem 0;
      display: inline-block;
      color: ${color};
      font-family: ${font};
      font-weight: ${fontWeight};
      font-size: ${fontSize};
    "
      ></sl-textarea>
    `;
  },

  bindings: () => [
    {
      key: "placeholder",
      label: msg("Textarea placeholder"),
      kind: "text",
      target: "sl-textarea",
      placeholder: msg("Enter textarea placeholder…"),
    },
    {
      key: "color",
      label: msg("Text color"),
      kind: "style",
      target: "sl-textarea",
      name: "color",
      placeholder: "#000000",
    },
    {
      key: "font-weight",
      label: msg("Font weight"),
      kind: "style",
      target: "sl-textarea",
      name: "font-weight",
      placeholder: "e.g. 400 or bold",
    },
    {
      key: "width",
      label: msg("Width (e.g. 320px, 60%)"),
      kind: "style",
      target: "sl-textarea",
      name: "width",
      placeholder: DEFAULT_WIDTH,
    },
    {
      key: "height",
      label: msg("Height (e.g. 120px)"),
      kind: "style",
      target: "sl-textarea",
      name: "height",
      placeholder: DEFAULT_HEIGHT,
    },
    {
      key: "font-size",
      label: msg("Font size"),
      kind: "style",
      target: "sl-textarea",
      name: "font-size",
      placeholder: "e.g. 32px or 2em",
    }
  ],

  settings: ({ data, setData }) => {
    const current = (data?.font as string) ?? DEFAULT_FONT;
    const currentLabel =
      FONT_OPTIONS.find((f) => f.value === current)?.label ?? msg("Choose font");

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">${msg("Typography")}</h2>

        <div class="setting-row">
          <div
            style="font-size: 0.8rem; color: var(--sl-color-neutral-600); margin-bottom: 0.25rem;"
          >
            ${msg("Font")}
          </div>

          <sl-dropdown placement="bottom-start" hoist>
            <sl-button slot="trigger" size="small" caret>
              ${currentLabel}
            </sl-button>

            <sl-menu
              style="max-height: 220px; overflow: auto; min-width: 260px;"
              @sl-select=${(e: CustomEvent) => {
                const item = e.detail.item as any;
                const next = String(item?.value ?? "");
                if (next) setData({ font: next });
              }}
            >
              ${FONT_OPTIONS.map(
                (f) => html`
                  <sl-menu-item
                    type="checkbox"
                    value=${f.value}
                    ?checked=${f.value === current}
                  >
                    <span style="font-family:${f.value}; white-space: nowrap;">
                      ${f.label}
                    </span>
                  </sl-menu-item>
                `,
              )}
            </sl-menu>
          </sl-dropdown>
        </div>

        <div class="setting-row" style="margin-top: 0.5rem;">
          <sl-button
            size="small"
            variant="default"
            @click=${() => setData({ font: DEFAULT_FONT })}
          >
            ${msg("Reset font")}
          </sl-button>
        </div>
      </div>
    `;
  },
};
