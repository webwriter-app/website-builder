import { html, nothing } from "lit";
import iconCode from "@tabler/icons/outline/code.svg";
import iconMinimize from "@tabler/icons/outline/minimize.svg";
import iconMaximize from "@tabler/icons/outline/maximize.svg";
import iconX from "@tabler/icons/outline/x.svg";
import type { WebwriterWebsiteBuilder } from "../../widgets/webwriter-website-builder";
import type { CodeTab } from "../../model/types";
import { wbGear } from "../icons";
import { renderCanvasInner } from "./render-canvas";
import {
  renderFloatingToolbar,
  renderTouchToolbar,
} from "./render-toolbar";
import {
  renderVisibilitySettings,
  renderLayoutSettings,
  renderSelectedComponentSettings,
} from "./render-sidebar";
import { renderLayersPanel } from "./render-layers";
import { renderIconDialog, renderAllComponentsDialog } from "./render-dialogs";

export function renderBuilderSettings(host: WebwriterWebsiteBuilder) {
  return html`
          <div class="settings">
            <h2>${wbGear} ${host.msg("Settings")}</h2>

            <sl-details summary=${host.msg("Canvas")}>
              ${renderLayersPanel(host)}

              <div class="settings-row">
                <sl-button
                  size="small"
                  variant="default"
                  @click=${host._confirmReset}
                  style="margin-left:auto;"
                >
                  ${host.msg("Reset Canvas")}
                </sl-button>
              </div>

              <div
                style="margin-top:0.5rem;font-size:0.78rem;color:var(--sl-color-neutral-600);
                          padding:0.4rem 0.6rem;background:var(--sl-color-neutral-50);
                          border-radius:8px;border:1px solid var(--sl-color-neutral-200);"
              >
                ${host.msg(html`Hold <kbd>T</kbd> to temporarily hide the toolbar overlay.`)}
              </div>
            </sl-details>

            ${renderVisibilitySettings(host)} ${renderLayoutSettings(host)}
            ${renderSelectedComponentSettings(host)}
          </div>
  `;
}

export function renderBuilder(host: WebwriterWebsiteBuilder) {
  const showGridOverlay = host.showGrid || host.gridKeyPressed;
  const showCode = host._codePanelOpen;
  const canFullscreen =
    host.ownerDocument.fullscreenEnabled &&
    typeof host.requestFullscreen === "function";
  const isAuthor = host.isAuthorMode();
  const isStudent = !isAuthor;

  const canShowStudentDrawer =
    isStudent && host.showComponentSettingsInStudent;
  const hasSingleSelection =
    Boolean(host.selectedNodeId) && host.selectedIds.size <= 1;
  const showDrawer =
    canShowStudentDrawer && hasSingleSelection && host._studentDrawerOpen;

  // The export is only needed while the code panel shows it.
  const exported = showCode ? host._generateExport() : null;
  const showStudentSidebar = isStudent && !showCode && host.showSidebarInStudent;

  return html`
    <div class="layout" tabindex="-1" data-mode=${host.layoutMode}>
      <div class="layout-row ${showCode ? "code-open" : ""}">
        ${isAuthor ? html`
          <dialog id="builder-settings" aria-label=${host.msg("Settings")} style="width:min(34rem,calc(100% - 2rem));max-height:85%;box-sizing:border-box">
            <form method="dialog"><button>${host.msg("Close")}</button></form>
            ${renderBuilderSettings(host)}
          </dialog>
        ` : showStudentSidebar ? renderBuilderSettings(host) : nothing}

        <!-- Editor / Canvas -->
        <div class="editor" style=${showCode ? "height:100%;" : ""}>
          <div
            class="canvas ${host.activeNodes.length > 0 ? "has-nodes" : ""}"
            part="canvas"
            @dragover=${host.drag.onDragOver.bind(host.drag)}
            @drop=${host.drag.onDrop.bind(host.drag)}
            style="--grid-size:${host.gridSize}px; background:${host
              .canvasBackground};"
            @click=${(e: MouseEvent) => host.selection.onCanvasClick(e)}
          >
            ${showGridOverlay ? html`<div class="grid-overlay"></div>` : null}
            ${renderCanvasInner(host)} ${renderFloatingToolbar(host)}

            ${renderViewControls(host, canFullscreen, showCode)}
          </div>
        </div>

        <!-- Code panel -->
        ${exported
          ? html`
              <div class="code-panel" part="code" role="region" aria-label=${host.msg("Code")}>
                <div class="code-header">
                  <sl-icon-button
                    src=${iconX}
                    label=${host.msg("Close")}
                    @click=${host._closeCodePanel}
                  >
                  </sl-icon-button>
                  <div class="code-title">${host.msg("Code")}</div>
                  <div class="code-tabs" role="tablist" aria-label=${host.msg("Code tabs")}>
                    ${renderCodeTabs(host)}
                  </div>
                </div>
                <pre class="code-body" tabindex="0">
                  ${host._codeTab === "combined"
                    ? exported.combined
                    : host._codeTab === "html"
                      ? exported.html
                      : exported.css}
                </pre
                >
                ${renderViewControls(host, canFullscreen, showCode, true)}
              </div>
            `
          : null}
      </div>

      <!-- Touch action bar: delete / grid / interact, for devices without a keyboard -->
      ${showCode ? null : renderTouchToolbar(host)}

      <!-- Student settings drawer -->
      ${showDrawer
        ? html`
            <sl-drawer
              label=${host.msg("Component settings")}
              placement="end"
              contained
              .open=${true}
              @sl-after-hide=${host._closeStudentDrawer}
              @sl-request-close=${(e: CustomEvent) => {
                e.preventDefault();
                host._closeStudentDrawer();
              }}
            >
              <div class="settings">
                ${renderSelectedComponentSettings(host, { bare: true })}
              </div>
            </sl-drawer>
          `
        : null}
      ${renderIconDialog(host)} ${renderAllComponentsDialog(host)}
    </div>
  `;
}

function renderViewControls(
  host: WebwriterWebsiteBuilder,
  canFullscreen: boolean,
  showCode: boolean,
  overCode = false,
) {
  return html`
    <div
      class="view-controls ${overCode ? "code-view-controls" : ""}"
      style=${host.toolbarKeyHidden ? "display:none;" : ""}
    >
      <sl-button
        size="small"
        variant="primary"
        title=${host.msg("Code")}
        aria-label=${host.msg("Code")}
        aria-pressed=${showCode ? "true" : "false"}
        @click=${host._toggleCodePanel}
      >
        <sl-icon src=${iconCode}></sl-icon>
      </sl-button>
      ${canFullscreen
        ? html`
            <sl-button
              size="small"
              variant="primary"
              title=${host.isFullscreen ? host.msg("Close") : host.msg("Fullscreen")}
              aria-label=${host.isFullscreen
                ? host.msg("Close")
                : host.msg("Fullscreen")}
              @click=${host._toggleFullscreen}
            >
              <sl-icon
                src=${host.isFullscreen ? iconMinimize : iconMaximize}
              ></sl-icon>
            </sl-button>
          `
        : null}
    </div>
  `;
}

function renderCodeTabs(host: WebwriterWebsiteBuilder) {
  const tabs: Array<[CodeTab, string]> = [
    ["combined", host.msg("Combined")],
    ["html", "HTML"],
    ["css", "CSS"],
  ];
  return tabs
    .filter(([t]) => host.visibleCodeTabs[t])
    .map(
      ([t, label]) => html`
        <button
          class="code-tab ${host._codeTab === t ? "active" : ""}"
          @click=${() => {
            host._codeTab = t;
            host.requestUpdate();
          }}
          type="button"
          role="tab"
          aria-selected=${host._codeTab === t ? "true" : "false"}
        >
          ${label}
        </button>
      `,
    );
}
