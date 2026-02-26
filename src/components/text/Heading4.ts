import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";
import { FONT_OPTIONS } from "../../builder/data";

const DEFAULT_FONT =
  "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";

export const Heading4: BuilderComponent = {
  type: "h4",
  label: "Heading 4",
  group: "text",

  defaultData: {
    font: DEFAULT_FONT,
  },

  render: (data) => {
    const font = data?.font ?? DEFAULT_FONT;
    const color = data?.color ?? "#000000";
    const content = data?.content ?? "Heading 4";

    return html`
      <h4
        style="
          margin: 0.5rem 0;
          display: inline-block;
          color: ${color};
          font-family: ${font};
        "
      >
        ${content}
      </h4>
    `;
  },

  bindings: [
    {
      key: "content",
      label: "Heading text",
      kind: "text",
      target: "h4",
      placeholder: "Enter heading…",
    },
    {
      key: "color",
      label: "Text color",
      kind: "style",
      target: "h4",
      name: "color",
      placeholder: "#000000",
    },
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
