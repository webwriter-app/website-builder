import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";
import { FONT_OPTIONS } from "../../builder/data/data";

const DEFAULT_FONT =
  "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";

export const ParagraphComponent: BuilderComponent = {
  type: "p",
  label: "Paragraph",
  group: "text",

  defaultData: {
    font: DEFAULT_FONT,
  },

  render: (data) => {
    const font = data?.font ?? DEFAULT_FONT;
    const color = data?.color ?? "#000000";
    const content = data?.content ?? "Paragraph";
    const fontWeight = data?.["font-weight"] ?? "normal";
    const width = data?.width ?? "auto";
    const height = data?.height ?? "auto";
    const fontSize = data?.["font-size"] ?? "1em";

    return html`
      <p
        style="
          margin: 0.5rem 0;
          display: inline-block;
          color: ${color};
          font-family: ${font};
          font-weight: ${fontWeight};
          width: ${width};
          height: ${height};
          font-size: ${fontSize};
        "
      >
        ${content}
      </p>
    `;
  },

  bindings: [
    {
      key: "content",
      label: "Paragraph text",
      kind: "text",
      target: "p",
      placeholder: "Enter paragraph…",
    },
    {
      key: "width",
      label: "Width",
      kind: "style",
      target: "p",
      name: "width",
      placeholder: "e.g. 300px",
    },
    {
      key: "height",
      label: "Height",
      kind: "style",
      target: "p",
      name: "height",
      placeholder: "e.g. 100px",
    },
    {
      key: "color",
      label: "Text color",
      kind: "style",
      target: "p",
      name: "color",
      placeholder: "#000000",
    },
    {
      key: "font-weight",
      label: "Font weight",
      kind: "style",
      target: "p",
      name: "font-weight",
      placeholder: "e.g. 400 or bold",
    },
    {
      key: "font-size",
      label: "Font size",
      kind: "style",
      target: "p",
      name: "font-size",
      placeholder: "e.g. 32px or 2em",
    }
  ],
  settings: ({ data, setData }) => {
    const current = (data?.font as string) ?? DEFAULT_FONT;
    const currentLabel =
      FONT_OPTIONS.find((f) => f.value === current)?.label ?? "Choose font";

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">Typography</h2>

        <div class="setting-row">
          <div
            style="font-size: 0.8rem; color: var(--sl-color-neutral-600); margin-bottom: 0.25rem;"
          >
            Font
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
            Reset font
          </sl-button>
        </div>
      </div>
    `;
  },
};
