import { html } from "lit";
import { msg } from "@lit/localize";
import type { WebwriterWebsiteBuilder } from "../../webwriter-website-builder";
import { CONTAINER_TEMPLATES, type LayoutMode } from "../types";
import { tileGlyph, componentSyntaxHint } from "../palette-helpers";
import { ComponentRegistry } from "../../components/registry";
import {
  wbH1Icon,
  wbTextIcon,
  wbImageIcon,
  wbIconIcon,
  wbButtonIcon,
  wbCloseIcon,
  wbDividerIcon,
  wbSearchIcon,
} from "../../assets/icons";

const LAYOUT_LABELS: Record<LayoutMode, string> = {
  freeform: "Freeform",
  flow: "Flow",
  flex: "Flex",
  grid: "Grid",
};

const TOOLBAR_QUICK_ITEMS = [
  { type: "h1", glyph: wbH1Icon, label: "H1" },
  { type: "paragraph", glyph: wbTextIcon, label: "Text" },
  { type: "image", glyph: wbImageIcon, label: "Image" },
  { type: "icon", glyph: wbIconIcon, label: "Icon" },
  { type: "button", glyph: wbButtonIcon, label: "Button" },
  { type: "divider", glyph: wbDividerIcon, label: "Divider" },
];

export function renderFloatingToolbar(host: WebwriterWebsiteBuilder) {
  const isAuthor = host.isContentEditable;
  const showAdd = isAuthor ? host.showAddButton : host.showToolbarInStudent;
  const showLayout = isAuthor
    ? host.showLayoutDropdown
    : host.showToolbarInStudent;
  if (!showAdd && !showLayout) return null;

  const hidden = host.toolbarKeyHidden;
  const visibleModes = (
    Object.keys(host.visibleLayoutModes) as LayoutMode[]
  ).filter((m) => host.visibleLayoutModes[m]);

  return html`
    <div
      class="floating-toolbar-wrap ${hidden ? "toolbar-hidden" : ""}"
      @click=${(e: MouseEvent) => e.stopPropagation()}
    >
      ${showAdd ? renderAddRow(host) : null}
      ${showLayout ? renderLayoutDropdown(host, visibleModes) : null}
      ${renderGroupToolbar(host)}
    </div>
  `;
}

function renderAddRow(host: WebwriterWebsiteBuilder) {
  return html`
    <div class="toolbar-top-row">
      ${host.toolbarOpen
        ? html`
            <div class="toolbar-pill">
              <button
                class="toolbar-icon-btn search-btn"
                title="Browse all components"
                @click=${() => {
                  host.openAllComponentsDialog();
                  host.toolbarOpen = false;
                }}
              >
                <span class="tb-glyph">${wbSearchIcon}</span>
              </button>
              <div class="toolbar-divider"></div>
              ${TOOLBAR_QUICK_ITEMS.map(
                (item) => html`
                  <button
                    class="toolbar-icon-btn"
                    title=${item.type}
                    draggable="true"
                    data-component-type=${item.type}
                    @dragstart=${(e: DragEvent) => {
                      host.drag.onDragStart(e);
                      host.toolbarOpen = false;
                    }}
                    @click=${() => {
                      host.quickAdd(item.type);
                      host.toolbarOpen = false;
                      host.requestUpdate();
                    }}
                  >
                    <span class="tb-glyph-icon">${item.glyph}</span>
                    <span class="tb-label">${item.label}</span>
                  </button>
                `,
              )}
            </div>
          `
        : null}
      <button
        class="toolbar-toggle ${host.toolbarOpen ? "open" : ""}"
        title=${host.toolbarOpen ? "Close" : "Add component"}
        @click=${() => {
          host.toolbarOpen = !host.toolbarOpen;
          if (!host.toolbarOpen) host.layoutDropdownOpen = false;
          host.requestUpdate();
        }}
      >
        +
      </button>
    </div>
  `;
}

function renderLayoutDropdown(
  host: WebwriterWebsiteBuilder,
  visibleModes: LayoutMode[],
) {
  return html`
    <div class="layout-dropdown-wrap">
      <button
        class="layout-dropdown-btn"
        @click=${(e: MouseEvent) => {
          e.stopPropagation();
          host.layoutDropdownOpen = !host.layoutDropdownOpen;
          host.requestUpdate();
        }}
      >
        ${LAYOUT_LABELS[host.layoutMode]}
        <span class="dd-arrow ${host.layoutDropdownOpen ? "up" : ""}">▼</span>
      </button>
      ${host.layoutDropdownOpen
        ? html`
            <div class="layout-dropdown-list">
              ${visibleModes.map(
                (mode) => html`
                  <button
                    class="layout-dropdown-item ${host.layoutMode === mode
                      ? "active"
                      : ""}"
                    @click=${() => {
                      host.layout.setLayoutMode(mode);
                      host.layoutDropdownOpen = false;
                      host.requestUpdate();
                    }}
                  >
                    ${LAYOUT_LABELS[mode]}
                  </button>
                `,
              )}
            </div>
          `
        : null}
    </div>
  `;
}

export function renderGroupToolbar(host: WebwriterWebsiteBuilder) {
  if (host.selectedIds.size < 2) return null;
  if (!host.isContentEditable) return null;

  return html`
    <div class="group-toolbar" @click=${(e: MouseEvent) => e.stopPropagation()}>
      <span class="group-count">${host.selectedIds.size} selected</span>

      <select
        class="group-template-select"
        .value=${host.groupTemplateId}
        @change=${(e: Event) => {
          host.groupTemplateId = (e.target as HTMLSelectElement).value;
        }}
      >
        ${CONTAINER_TEMPLATES.map(
          (t) =>
            html`<option value=${t.id} title=${t.description}>
              ${t.label}
            </option>`,
        )}
      </select>

      <button
        class="group-btn"
        @click=${() => host.groupSelected()}
        title="Wrap selected nodes in a container"
      >
        Group
      </button>

      <button
        class="group-btn group-btn--cancel"
        @click=${() => host.clearSelection()}
        title="Clear selection"
      >
        ${wbCloseIcon}
      </button>
    </div>
  `;
}

// ─── Layout button (segmented control) ───────────────────────────────────────

export function renderLayoutBtn(
  host: WebwriterWebsiteBuilder,
  mode: LayoutMode,
  label: string,
) {
  const active = host.layoutMode === mode;
  return html`
    <button
      class="seg-btn ${active ? "active" : ""}"
      @click=${() => host.layout.setLayoutMode(mode)}
      type="button"
      title=${`Switch layout to ${mode}`}
    >
      ${label}
    </button>
  `;
}

// ─── Palette tile (drag + click for info popup) ───────────────────────────────

export function renderPaletteTile(
  host: WebwriterWebsiteBuilder,
  type: string,
  opts: { compact: boolean },
) {
  const comp = ComponentRegistry[type];
  const label = comp?.label ?? type;

  const onDragStart = (e: DragEvent) => {
    host.suppressNextClick = true;
    setTimeout(() => (host.suppressNextClick = false), 0);
    host.drag.onDragStart(e);
    requestAnimationFrame(() => {
      host.trayOpen = false;
      host.requestUpdate();
    });
  };

  const onClick = (e: MouseEvent) => {
    if (host.suppressNextClick) return;
    e.stopPropagation();
    host.infoForType = type;
    host.infoAnchorEl = e.currentTarget as HTMLElement;
    host.requestUpdate();
  };

  return html`
    <div
      class="tile"
      draggable="true"
      data-component-type=${type}
      @dragstart=${onDragStart}
      @click=${onClick}
      title="Drag to canvas · Click for info"
      style=${opts.compact ? "height: 64px;" : "height: 72px;"}
    >
      <div class="tile-icon">${tileGlyph(type)}</div>
      <div class="tile-label">${msg(label)}</div>
    </div>
  `;
}

// ─── Info popup (shown when clicking a palette tile) ──────────────────────────

export function renderInfoPopup(host: WebwriterWebsiteBuilder) {
  if (!host.infoForType || !host.infoAnchorEl) return null;

  const comp = ComponentRegistry[host.infoForType];
  const label = comp?.label ?? host.infoForType;
  const syntax = componentSyntaxHint(host.infoForType);

  const insert = () => {
    host.quickAdd(host.infoForType!);
    host.infoForType = null;
    host.infoAnchorEl = null;
    host.trayOpen = false;
    host.requestUpdate();
  };

  return html`
    <sl-popup
      placement="bottom-start"
      strategy="fixed"
      ?active=${true}
      .anchor=${host.infoAnchorEl}
    >
      <sl-card
        style="width: 320px;"
        @mousedown=${(e: MouseEvent) => e.stopPropagation()}
      >
        <div
          style="display:flex; align-items:center; justify-content:space-between; gap: 0.75rem;"
        >
          <div style="font-weight: 600; color: var(--sl-color-neutral-900);">
            ${msg(label)}
          </div>
          <sl-button size="small" variant="primary" @click=${insert}
            >Insert</sl-button
          >
        </div>

        <div
          style="margin-top: 0.4rem; font-size: 0.8rem; color: var(--sl-color-neutral-600);"
        >
          Drag to place on canvas. Click Insert to add at default position.
        </div>

        <div style="margin-top: 0.6rem;">
          <div
            style="font-size: 0.75rem; color: var(--sl-color-neutral-500); margin-bottom: 0.25rem;"
          >
            Syntax (preview)
          </div>
          <pre
            style="
            margin: 0;
            padding: 0.6rem;
            border-radius: 10px;
            background: var(--sl-color-neutral-50);
            border: 1px solid var(--sl-color-neutral-200);
            font-size: 0.75rem;
            overflow: auto;
          "
          >
${syntax}</pre
          >
        </div>
      </sl-card>
    </sl-popup>
  `;
}
