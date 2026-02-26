import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";
import "../../assets/shoelaceImports";
import { SHOELACE_ICON_NAMES } from "../../builder/data/shoelaceIcons";

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

  bindings: [
    {
      key: "name",
      label: "Icon name",
      kind: "attr",
      target: "sl-icon",
      name: "name",
      placeholder: "Pick from the dialog or type e.g. gear, heart, star…",
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

  settings: ({ data, setData }) => {
    const currentName = (data?.name as string) ?? DEFAULT_ICON;

    const resetIcon = () => {
      setData({ name: DEFAULT_ICON, size: "32px", color: DEFAULT_COLOR });
    };

    const showDialog = (e: Event) => {
      const host = (e.currentTarget as HTMLElement)?.closest(".icon-settings");
      const dialog = host?.querySelector("sl-dialog") as any;
      dialog?.show();
      // Focus search on open
      setTimeout(() => {
        const input = host?.querySelector('sl-input[data-role="search"]') as any;
        input?.focus();
      }, 0);
    };

    const applyFilters = (host: Element) => {
      const input = host.querySelector('sl-input[data-role="search"]') as any;
      const tabs = host.querySelector('sl-tab-group[data-role="style"]') as any;

      const term = String(input?.value ?? "").trim().toLowerCase();
      const style = String(tabs?.activeTab?.panel ?? "all"); // "all" | "outlined" | "filled"

      const tiles = Array.from(host.querySelectorAll<HTMLElement>("[data-icon-tile]"));
      for (const tile of tiles) {
        const name = (tile.dataset.name ?? "").toLowerCase();
        const isFilled = name.endsWith("-fill");
        const styleOk =
          style === "all" || (style === "filled" ? isFilled : !isFilled);
        const termOk = !term || name.includes(term);
        tile.hidden = !(styleOk && termOk);
      }

      // Update count
      const countEl = host.querySelector('[data-role="count"]');
      if (countEl) {
        const visible = tiles.reduce((n, t) => n + (!t.hidden ? 1 : 0), 0);
        countEl.textContent = String(visible);
      }
    };

    const onSearch = (e: Event) => {
      const host = (e.currentTarget as HTMLElement)?.closest(".icon-settings");
      if (host) applyFilters(host);
    };

    const onTabChange = (e: Event) => {
      const host = (e.currentTarget as HTMLElement)?.closest(".icon-settings");
      if (host) applyFilters(host);
    };

    const pickIcon = (e: Event) => {
      const btn = e.currentTarget as HTMLElement;
      const name = btn.dataset.name ?? "";
      if (!name) return;

      setData({ name });

      const host = btn.closest(".icon-settings");
      const dialog = host?.querySelector("sl-dialog") as any;
      dialog?.hide();
    };

    return html`
      <div class="icon-settings" style="margin-top: 1rem">
        <style>
          .setting-row {
            margin: 0.5rem 0;
          }

          .picker-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
            gap: 0.5rem;
          }

          .tile {
            appearance: none;
            border: 1px solid var(--sl-color-neutral-200);
            background: var(--sl-color-neutral-0);
            border-radius: 10px;
            padding: 0.5rem 0.4rem;
            cursor: pointer;
            display: grid;
            justify-items: center;
            gap: 0.35rem;
          }

          .tile:hover {
            border-color: var(--sl-color-primary-300);
          }

          .tile[aria-current="true"] {
            border-color: var(--sl-color-primary-600);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--sl-color-primary-600), transparent 75%);
          }

          .tile sl-icon {
            font-size: 22px;
            color: var(--sl-color-neutral-900);
          }

          .tile .name {
            font-size: 11px;
            line-height: 1.2;
            text-align: center;
            color: var(--sl-color-neutral-600);
            word-break: break-word;
          }

          .dialog-body {
            display: grid;
            gap: 0.75rem;
          }

          .scroll {
            max-height: min(55vh, 520px);
            overflow: auto;
            padding-right: 0.25rem;
          }
        </style>

        <h2 style="margin-top: 0">Icon</h2>

        <div class="setting-row" style="display:flex; gap: 0.5rem; align-items:center;">
          <sl-button size="small" variant="primary" @click=${showDialog}>
            Choose icon…
          </sl-button>

          <div style="font-size: 0.85rem; color: var(--sl-color-neutral-600);">
            Current: <code>${currentName}</code>
          </div>
        </div>

        <div class="setting-row">
          <sl-button size="small" variant="default" @click=${resetIcon}>
            Reset to default
          </sl-button>
        </div>

        <sl-dialog label="Choose an icon" class="icon-dialog" style="--width: 860px;">
          <div class="dialog-body">
            <div style="display:flex; gap: 0.75rem; align-items: end; flex-wrap: wrap;">
              <div style="flex: 1; min-width: 240px;">
                <div style="font-size: 0.8rem; color: var(--sl-color-neutral-600); margin-bottom: 0.25rem;">
                  Search
                </div>
                <sl-input
                  data-role="search"
                  clearable
                  placeholder="Type to filter (e.g. gear, arrow, chevron, person…)"
                  @sl-input=${onSearch}
                  @sl-clear=${onSearch}
                ></sl-input>
              </div>

              <div>
                <div style="font-size: 0.8rem; color: var(--sl-color-neutral-600); margin-bottom: 0.25rem;">
                  Style
                </div>
                <sl-tab-group data-role="style" @sl-tab-show=${onTabChange}>
                  <sl-tab slot="nav" panel="all">All</sl-tab>
                  <sl-tab slot="nav" panel="outlined">Outlined</sl-tab>
                  <sl-tab slot="nav" panel="filled">Filled</sl-tab>

                  <sl-tab-panel name="all"></sl-tab-panel>
                  <sl-tab-panel name="outlined"></sl-tab-panel>
                  <sl-tab-panel name="filled"></sl-tab-panel>
                </sl-tab-group>
              </div>

              <div style="margin-left:auto; font-size: 0.85rem; color: var(--sl-color-neutral-600);">
                Showing <span data-role="count">${SHOELACE_ICON_NAMES.length}</span>
              </div>
            </div>

            <div class="scroll" @slotchange=${(e: Event) => {
              const host = (e.currentTarget as HTMLElement)?.closest(".icon-settings");
              if (host) applyFilters(host);
            }}>
              <div class="picker-grid">
                ${SHOELACE_ICON_NAMES.map((name) => {
                  const selected = name === currentName;
                  return html`
                    <button
                      class="tile"
                      data-icon-tile
                      data-name=${name}
                      aria-current=${selected ? "true" : "false"}
                      @click=${pickIcon}
                    >
                      <sl-icon name=${name}></sl-icon>
                      <div class="name">${name}</div>
                    </button>
                  `;
                })}
              </div>
            </div>
          </div>

          <sl-button
            slot="footer"
            size="small"
            variant="default"
            @click=${(e: Event) => (e.currentTarget as any)?.closest("sl-dialog")?.hide()}
          >
            Close
          </sl-button>
        </sl-dialog>
      </div>
    `;
  },
};