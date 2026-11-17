import { html } from "lit";
import type { MsgFn } from "@lit/localize";
import type { WebwriterWebsiteBuilder } from "../../widgets/webwriter-website-builder";
import { getContainerTemplates, type LayoutMode } from "../../model/types";
import { quickAdd } from "./quick-add";
import {
  wbH1Icon,
  wbTextIcon,
  wbImageIcon,
  wbIconIcon,
  wbButtonIcon,
  wbCloseIcon,
  wbDividerIcon,
  wbSearchIcon,
} from "../icons";
import "../shoelace-imports";
import iconTrash from "@tabler/icons/outline/trash.svg";
import iconLayoutGrid from "@tabler/icons/outline/layout-grid.svg";
import iconHandClick from "@tabler/icons/outline/hand-click.svg";

const getLayoutLabels = (msg: MsgFn): Record<LayoutMode, string> => ({
  freeform: msg("Freeform"),
  flow: msg("Flow"),
  flex: "Flex",
  grid: msg("Grid"),
});

const getToolbarQuickItems = (msg: MsgFn) => [
  { type: "h1", glyph: wbH1Icon, label: "H1" },
  { type: "paragraph", glyph: wbTextIcon, label: msg("Text") },
  { type: "image", glyph: wbImageIcon, label: msg("Image") },
  { type: "icon", glyph: wbIconIcon, label: msg("Icon") },
  { type: "button", glyph: wbButtonIcon, label: msg("Button") },
  { type: "divider", glyph: wbDividerIcon, label: msg("Divider") },
];

export function renderFloatingToolbar(host: WebwriterWebsiteBuilder) {
  const isAuthor = host.isAuthorMode();
  const showAdd = isAuthor ? host.showAddButton : host.showToolbarInStudent;
  const showLayout = isAuthor
    ? host.showLayoutDropdown
    : host.showToolbarInStudent;
  const showGroup = host.selectedIds.size >= 2;
  if (!showAdd && !showLayout && !showGroup) return null;

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
                title=${host.msg("Browse all components")}
                @click=${() => {
                  host.openAllComponentsDialog();
                  host.toolbarOpen = false;
                }}
              >
                <span class="tb-glyph">${wbSearchIcon}</span>
              </button>
              <div class="toolbar-divider"></div>
              ${getToolbarQuickItems(host.msg).map(
                (item) => html`
                  <button
                    class="toolbar-icon-btn"
                    title=${item.label}
                    draggable="true"
                    data-component-type=${item.type}
                    @dragstart=${(e: DragEvent) => {
                      host.drag.onDragStart(e);
                      host.toolbarOpen = false;
                    }}
                    @click=${() => {
                      quickAdd(host, item.type);
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
        title=${host.toolbarOpen ? host.msg("Close") : host.msg("Add component")}
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
        ${getLayoutLabels(host.msg)[host.layoutMode]}
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
                    ${getLayoutLabels(host.msg)[mode]}
                  </button>
                `,
              )}
            </div>
          `
        : null}
    </div>
  `;
}

// ─── Touch action bar (delete / grid / interact — no keyboard needed) ─────────

export function renderTouchToolbar(host: WebwriterWebsiteBuilder) {
  const deleteBlocked = host.isStudentMode() && !host.allowDeleteInStudent;

  return html`
    <div class="touch-toolbar">
      ${!deleteBlocked ? html`
        <sl-button
          class="touch-toolbar-btn"
          size="small"
          ?disabled=${!host.selectedNodeId}
          @click=${() => host.deleteSelectedNode()}
        >
          <sl-icon src=${iconTrash} slot="prefix"></sl-icon>
          ${host.msg("Delete")}
        </sl-button>
      `: null}

      <sl-button
        class="touch-toolbar-btn"
        size="small"
        variant=${host.gridKeyPressed ? "primary" : "default"}
        @click=${() => {
          host.gridKeyPressed = !host.gridKeyPressed;
          host.requestUpdate();
        }}
      >
        <sl-icon src=${iconLayoutGrid} slot="prefix"></sl-icon>
        ${host.msg("Grid")}
      </sl-button>

      <sl-button
        class="touch-toolbar-btn"
        size="small"
        variant=${host.interactKeyPressed ? "primary" : "default"}
        @click=${() => {
          host.interactKeyPressed = !host.interactKeyPressed;
          host.requestUpdate();
        }}
      >
        <sl-icon src=${iconHandClick} slot="prefix"></sl-icon>
        ${host.msg("Interact")}
      </sl-button>
    </div>
  `;
}

export function renderGroupToolbar(host: WebwriterWebsiteBuilder) {
  if (host.selectedIds.size < 2) return null;

  return html`
    <div class="group-toolbar" @click=${(e: MouseEvent) => e.stopPropagation()}>
      <span class="group-count">${host.selectedIds.size} ${host.msg("selected")}</span>

      <sl-select
        class="group-template-select"
        size="small"
        .value=${host.groupTemplateId}
        @change=${(e: Event) => {
          host.groupTemplateId = (e.target as HTMLSelectElement).value;
        }}
      >
        ${getContainerTemplates(host.msg).map(
          (t) =>
            html`<sl-option value=${t.id} title=${t.description}>
              ${t.label}
            </sl-option>`,
        )}
      </sl-select>

      <button
        class="group-btn"
        @click=${() => host.groupSelected()}
        title=${host.msg("Wrap selected nodes in a container")}
      >
        ${host.msg("Group")}
      </button>

      <button
        class="group-btn group-btn--cancel"
        @click=${() => host.clearSelection()}
        title=${host.msg("Clear selection")}
      >
        ${wbCloseIcon}
      </button>
    </div>
  `;
}
