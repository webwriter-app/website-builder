import { html } from "lit";
import type { WebwriterWebsiteBuilder } from "../../webwriter-website-builder";
import { ComponentRegistry } from "../../components/registry";
import { SHOELACE_ICON_NAMES } from "../data/shoelaceIcons";
import { componentSyntaxHint, tileGlyph } from "../palette-helpers";
import { msg } from "@lit/localize";

// ─── Icon Dialog ──────────────────────────────────────────────────────────────

export function renderIconDialog(host: WebwriterWebsiteBuilder) {
  const q = host.iconQuery.trim().toLowerCase();
  const items = q
    ? SHOELACE_ICON_NAMES.filter((n) => n.toLowerCase().includes(q))
    : SHOELACE_ICON_NAMES;

  return html`
    <sl-dialog
      id="ww-icon-dialog"
      label=${msg("Choose an icon")}
      .open=${host.iconDialogOpen}
      @sl-after-show=${host.onIconDialogAfterShow}
      @sl-after-hide=${host.onIconDialogAfterHide}
    >
      <div class="dlg">
        <div class="topbar">
          <sl-input
            id="ww-icon-search"
            class="icon-search"
            size="small"
            clearable
            placeholder=${msg("Search icons…")}
            .value=${host.iconQuery}
            @sl-input=${(e: Event) => {
              const input = e.currentTarget as any;
              host.iconQuery = String(input.value ?? "");
              host.iconScrollTop = 0;
              host.iconScroller?.scrollTo({ top: 0 });
              host.requestUpdate();
            }}
            @sl-clear=${() => (host.iconQuery = "")}
          ></sl-input>

          <sl-input
            class="icon-color"
            size="small"
            label=${msg("Icon color")}
            placeholder="#0f172a"
            .value=${host.iconDraftColor}
            @sl-input=${(e: any) => {
              host.iconDraftColor = String(
                e?.target?.value ?? e?.detail?.value ?? (e?.currentTarget as any)?.value ?? "",
              );
              host.requestUpdate();
            }}
          ></sl-input>
        </div>

        <div class="scroller" id="ww-icon-scroller">
          ${renderIconVirtualGrid(host, items)}
        </div>

        <div class="footer">
          <div style="display:flex;gap:0.5rem;">
            <sl-button
              size="small"
              variant="default"
              @click=${() =>
                (host.renderRoot.querySelector("#ww-icon-dialog") as any)?.hide?.()}
            >${msg("Cancel")}</sl-button>

            <sl-button
              size="small"
              variant="primary"
              @click=${() => {
                const detail = { name: host.iconDraftName, color: host.iconDraftColor };
                (host.iconDialogTarget as HTMLElement | null)?.dispatchEvent(
                  new CustomEvent("ww-icon-picker-result", {
                    detail,
                    bubbles: true,
                    composed: true,
                  }),
                );
                (host.renderRoot.querySelector("#ww-icon-dialog") as any)?.hide?.();
              }}
            >${msg("Use icon")}</sl-button>
          </div>
        </div>
      </div>
    </sl-dialog>
  `;
}

function renderIconVirtualGrid(host: WebwriterWebsiteBuilder, items: string[]) {
  const ICON_ROW_H = 60;
  const ICON_OVERSCAN = 3;

  const width = host.iconScroller?.clientWidth ?? 760;
  const minCol = 56;
  const cols = Math.max(1, Math.floor((width - 24) / (minCol + 6)));
  const totalRows = Math.ceil(items.length / cols);
  const spacerH = totalRows * ICON_ROW_H;

  let startRow = Math.floor(host.iconScrollTop / ICON_ROW_H) - ICON_OVERSCAN;
  startRow = Math.max(0, Math.min(startRow, totalRows - 1));
  const endRow = Math.min(
    totalRows,
    Math.ceil((host.iconScrollTop + host.iconViewportH) / ICON_ROW_H) + ICON_OVERSCAN,
  );

  const startIndex = startRow * cols;
  const endIndex = Math.min(items.length, endRow * cols);
  const slice = items.slice(startIndex, endIndex);
  const offsetY = startRow * ICON_ROW_H;

  return html`
    <div class="spacer" style="--spacer-h:${spacerH}px"></div>
    <div class="grid" style="transform:translateY(${offsetY}px);">
      ${slice.map((name) => {
        const selected = name === host.iconDraftName;
        return html`
          <button
            class="icon-tile"
            data-selected=${selected ? "true" : "false"}
            type="button"
            title=${name}
            @click=${() => {
              host.iconDraftName = name;
              host.requestUpdate();
            }}
          >
            <sl-icon name=${name} style="color:${host.iconDraftColor};"></sl-icon>
            <span class="fallback">${name.slice(0, 2)}</span>
          </button>
        `;
      })}
    </div>
  `;
}

// ─── All Components Dialog ────────────────────────────────────────────────────

export function renderAllComponentsDialog(host: WebwriterWebsiteBuilder) {
  const q = host.allComponentsQuery.trim().toLowerCase();
  const allTypes = Object.keys(ComponentRegistry);

  const types = (
    q
      ? allTypes.filter((t) => {
          const label = (ComponentRegistry[t]?.label() ?? t).toLowerCase();
          return t.toLowerCase().includes(q) || label.includes(q);
        })
      : allTypes
  ).sort((a, b) => {
    const la = (ComponentRegistry[a]?.label() ?? a).toLowerCase();
    const lb = (ComponentRegistry[b]?.label() ?? b).toLowerCase();
    return la.localeCompare(lb);
  });

  return html`
    <sl-dialog
      id="ww-all-components-dialog"
      label=${msg("All components")}
      .open=${host.allComponentsDialogOpen}
      @sl-after-show=${(e: any) => {
        const dlg = e.target as HTMLElement;
        queueMicrotask(() => {
          (dlg.querySelector("#ww-all-components-search") as any)?.focus?.();
        });
      }}
      @sl-after-hide=${() => {
        host.allComponentsDialogOpen = false;
      }}
    >
      <div style="display:flex;gap:0.75rem;align-items:flex-end;margin-bottom:0.75rem;">
        <sl-input
          id="ww-all-components-search"
          size="small"
          clearable
          label=${msg("Search")}
          placeholder=${msg("Search components…")}
          .value=${host.allComponentsQuery}
          @sl-input=${(e: any) => {
            host.allComponentsQuery = String(
              e?.currentTarget?.value ?? e?.target?.value ?? e?.detail?.value ?? "",
            );
            host.requestUpdate();
          }}
          @sl-clear=${() => (host.allComponentsQuery = "")}
          style="flex:1;"
        ></sl-input>

        <div style="font-size:0.85rem;color:var(--sl-color-neutral-600);padding-bottom:0.25rem;">
          ${types.length} ${types.length === 1 ? msg("item") : msg("items")}
        </div>
      </div>

      <div style="max-height:60vh;overflow:auto;display:grid;gap:0.75rem;">
        ${types.map((type) => {
          const comp = ComponentRegistry[type];
          const label = comp?.label?.() ?? type;
          const syntax = componentSyntaxHint(type);

          return html`
            <sl-card>
              <div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  <div class="tile-icon" style="width:auto;">${tileGlyph(type)}</div>
                  <div style="font-weight:600;">${label}</div>
                </div>
                <sl-button
                  size="small"
                  variant="primary"
                  @click=${() => {
                    host.quickAdd(type);
                    host.requestUpdate();
                  }}
                >${msg("Insert")}</sl-button>
              </div>

              <div style="margin-top:0.35rem;font-size:0.8rem;color:var(--sl-color-neutral-600);">
                ${msg("Drag tiles from the palette, or insert here at default position.")}
              </div>

              <div style="margin-top:0.6rem;">
                <div style="font-size:0.75rem;color:var(--sl-color-neutral-500);margin-bottom:0.25rem;">
                  ${msg("Syntax (preview)")}
                </div>
                <pre style="margin:0;padding:0.6rem;border-radius:10px;background:var(--sl-color-neutral-50);border:1px solid var(--sl-color-neutral-200);font-size:0.75rem;overflow:auto;">${syntax}</pre>
              </div>
            </sl-card>
          `;
        })}
      </div>

      <div slot="footer" style="display:flex;justify-content:flex-end;gap:0.5rem;">
        <sl-button
          size="small"
          variant="default"
          @click=${() =>
            (host.renderRoot.querySelector("#ww-all-components-dialog") as any)?.hide?.()}
        >${msg("Close")}</sl-button>
      </div>
    </sl-dialog>
  `;
}