import { html } from "lit";
import { keyed } from "lit/directives/keyed.js";
import type { WebwriterWebsiteBuilder } from "../../widgets/webwriter-website-builder";
import { ComponentRegistry } from "../registry";
import type {
  BuilderNode,
  CodeTab,
  FlexItemSettings,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "../../model/types";
import { findParentNode } from "../../model/layout";
import { renderContainerSettings } from "./render-container-settings";
import iconLayoutColumns from "@tabler/icons/outline/layout-columns.svg";
import iconCode from "@tabler/icons/outline/code.svg";
import iconUser from "@tabler/icons/outline/user.svg";
import iconSchool from "@tabler/icons/outline/school.svg";
import iconPencil from "@tabler/icons/outline/pencil.svg";
import iconArrowsMove from "@tabler/icons/outline/arrows-move.svg";
import iconArrowDown from "@tabler/icons/outline/arrow-down.svg";
import iconLayoutDistributeHorizontal from "@tabler/icons/outline/layout-distribute-horizontal.svg";
import iconLayoutGrid from "@tabler/icons/outline/layout-grid.svg";

// ─── Visibility Settings ──────────────────────────────────────────────────────

export function renderVisibilitySettings(host: WebwriterWebsiteBuilder) {
  if (!host.isAuthorMode()) return null;
  const isStudent = !host.isAuthorMode();

  return html`
    <sl-details summary=${host.msg("Visibility")}>
      <div class="vis-section">
        <div class="vis-section-label">
          <sl-icon src=${iconLayoutColumns}></sl-icon>
          ${host.msg("Layout modes")}
        </div>
        <div class="vis-chips">
          ${layoutModeChip(host, "freeform", host.msg("Freeform"), iconArrowsMove)}
          ${layoutModeChip(host, "flow", host.msg("Flow"), iconArrowDown)}
          ${layoutModeChip(host, "flex", "Flex", iconLayoutDistributeHorizontal)}
          ${layoutModeChip(host, "grid", host.msg("Grid"), iconLayoutGrid)}
        </div>
      </div>

      <div class="vis-section">
        <div class="vis-section-label">
          <sl-icon src=${iconCode}></sl-icon>
          ${host.msg("Code tabs")}
        </div>
        <div class="vis-chips">
          ${codeTabChip(host, "combined", host.msg("Combined"))}
          ${codeTabChip(host, "html", "HTML")}
          ${codeTabChip(host, "css", "CSS")}
        </div>
      </div>

      <div class="vis-section">
        <div class="vis-section-label">
          <sl-icon src=${iconUser}></sl-icon>
          ${host.msg("Student mode")}
        </div>

        <div class="vis-switch-row">
          <span class="vis-switch-label">${host.msg("Show component settings")}</span>
          <sl-switch
            size="small"
            .checked=${host.showComponentSettingsInStudent}
            @sl-change=${(e: CustomEvent) => {
              host.showComponentSettingsInStudent = Boolean(
                (e.currentTarget as HTMLInputElement).checked,
              );
              host.requestUpdate();
            }}
          ></sl-switch>
        </div>

        <div class="vis-switch-row">
          <span class="vis-switch-label">${host.msg("Show sidebar")}</span>
          <sl-switch
            size="small"
            .checked=${host.showSidebarInStudent}
            @sl-change=${(e: CustomEvent) => {
              host.showSidebarInStudent = Boolean(
                (e.currentTarget as HTMLInputElement).checked,
              );
              host.requestUpdate();
            }}
          ></sl-switch>
        </div>

        <div class="vis-switch-row">
          <span class="vis-switch-label">${host.msg("Show toolbar")}</span>
          <sl-switch
            size="small"
            .checked=${host.showToolbarInStudent}
            @sl-change=${(e: CustomEvent) => {
              host.showToolbarInStudent = Boolean(
                (e.currentTarget as HTMLInputElement).checked,
              );
              host.requestUpdate();
            }}
          ></sl-switch>
        </div>

        <div class="vis-switch-row">
          <span class="vis-switch-label">${host.msg("Allow delete")}</span>
          <sl-switch
            size="small"
            .checked=${host.allowDeleteInStudent}
            @sl-change=${(e: CustomEvent) => {
              host.allowDeleteInStudent = Boolean(
                (e.currentTarget as HTMLInputElement).checked,
              );
              host.requestUpdate();
            }}
          ></sl-switch>
        </div>

        <div class="vis-mode-badge">
          <sl-icon src=${isStudent ? iconSchool : iconPencil}></sl-icon>
          ${isStudent ? host.msg("Student mode") : host.msg("Author mode")}
        </div>
      </div>
    </sl-details>
  `;
}

function layoutModeChip(
  host: WebwriterWebsiteBuilder,
  mode: LayoutMode,
  label: string,
  icon: string,
) {
  const active = !!host.visibleLayoutModes[mode];
  return html`
    <button
      class="vis-chip"
      data-active=${active ? "true" : "false"}
      type="button"
      @click=${() => host.layout.setLayoutModeVisible(mode, !active)}
    >
      <sl-icon src=${icon} style="font-size:10px;flex-shrink:0;"></sl-icon>
      ${label}
    </button>
  `;
}

function codeTabChip(
  host: WebwriterWebsiteBuilder,
  tab: CodeTab,
  label: string,
) {
  const active = !!host.visibleCodeTabs[tab];
  return html`
    <button
      class="vis-chip"
      data-active=${active ? "true" : "false"}
      type="button"
      @click=${() => host.setCodeTabVisible(tab, !active)}
    >
      ${label}
    </button>
  `;
}

// ─── Layout Settings ─────────────────────────────────────────────────────────

export function renderLayoutSettings(host: WebwriterWebsiteBuilder) {
  if (host.layoutMode === "flex") {
    const flex = host.flexSettings;
    return keyed(
      "layout-flex",
      html`
        <sl-details summary=${host.msg("Layout")}>
          <div style="margin-top: 1rem">
            <div class="setting-row">
              <sl-select
                value=${flex.direction ?? "row"}
                @sl-change=${(e: ControlEvent) =>
                  host.layout.setFlexSettings({
                    direction: e.target.value as FlexSettings["direction"],
                  })}
              >
                <span slot="label">${host.msg("Direction")} <span class="css-prop">(<code>flex-direction</code>)</span></span>
                <sl-option value="row">row</sl-option>
                <sl-option value="column">column</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-select
                value=${flex.justify ?? "flex-start"}
                @sl-change=${(e: ControlEvent) =>
                  host.layout.setFlexSettings({ justify: e.target.value })}
              >
                <span slot="label">${host.msg("Justify content")} <span class="css-prop">(<code>justify-content</code>)</span></span>
                <sl-option value="flex-start">flex-start</sl-option>
                <sl-option value="center">center</sl-option>
                <sl-option value="flex-end">flex-end</sl-option>
                <sl-option value="space-between">space-between</sl-option>
                <sl-option value="space-around">space-around</sl-option>
                <sl-option value="space-evenly">space-evenly</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-select
                value=${flex.align ?? "stretch"}
                @sl-change=${(e: ControlEvent) =>
                  host.layout.setFlexSettings({ align: e.target.value })}
              >
                <span slot="label">${host.msg("Align items")} <span class="css-prop">(<code>align-items</code>)</span></span>
                <sl-option value="stretch">stretch</sl-option>
                <sl-option value="flex-start">flex-start</sl-option>
                <sl-option value="center">center</sl-option>
                <sl-option value="flex-end">flex-end</sl-option>
                <sl-option value="baseline">baseline</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-select
                value=${flex.wrap ?? "nowrap"}
                @sl-change=${(e: ControlEvent) =>
                  host.layout.setFlexSettings({
                    wrap: e.target.value as FlexSettings["wrap"],
                  })}
              >
                <span slot="label">${host.msg("Wrap")} <span class="css-prop">(<code>flex-wrap</code>)</span></span>
                <sl-option value="nowrap">nowrap</sl-option>
                <sl-option value="wrap">wrap</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-input
                placeholder=${`${host.msg("e.g.")} 12px`}
                .value=${flex.gap ?? "12px"}
                @sl-input=${(e: ControlEvent) =>
                  host.layout.setFlexSettings({
                    gap: String(e.target.value ?? ""),
                  })}
              >
                <span slot="label">${host.msg("Gap")} <span class="css-prop">(<code>gap</code>)</span></span>
              </sl-input>
            </div>
          </div>
        </sl-details>
      `,
    );
  }

  if (host.layoutMode === iconLayoutGrid) {
    const grid = host.gridSettings;
    return keyed(
      "layout-grid",
      html`
        <sl-details summary=${host.msg("Layout")}>
          <div style="margin-top: 1rem">

            <div class="setting-row">
              <sl-input
                placeholder=${`${host.msg("e.g.")} repeat(3, 1fr)`}
                .value=${grid.columns ?? "repeat(3, 1fr)"}
                @sl-input=${(e: ControlEvent) =>
                  host.layout.setGridSettings({
                    columns: String(e.target.value ?? ""),
                  })}
              >
                <span slot="label">${host.msg("Columns")} <span class="css-prop">(<code>grid-template-columns</code>)</span></span>
              </sl-input>
            </div>

            <div class="setting-row">
              <sl-input
                placeholder=${`${host.msg("e.g.")} auto`}
                .value=${grid.rows ?? "auto"}
                @sl-input=${(e: ControlEvent) =>
                  host.layout.setGridSettings({
                    rows: String(e.target.value ?? ""),
                  })}
              >
                <span slot="label">${host.msg("Rows")} <span class="css-prop">(<code>grid-template-rows</code>)</span></span>
              </sl-input>
            </div>

            <div class="setting-row">
              <sl-input
                placeholder=${`${host.msg("e.g.")} 12px`}
                .value=${grid.gap ?? "12px"}
                @sl-input=${(e: ControlEvent) =>
                  host.layout.setGridSettings({
                    gap: String(e.target.value ?? ""),
                  })}
              >
                <span slot="label">${host.msg("Gap")} <span class="css-prop">(<code>gap</code>)</span></span>
              </sl-input>
            </div>

            <div class="setting-row">
              <sl-select
                value=${grid.autoFlow ?? "row"}
                @sl-change=${(e: ControlEvent) =>
                  host.layout.setGridSettings({
                    autoFlow: e.target.value as GridSettings["autoFlow"],
                  })}
              >
                <span slot="label">${host.msg("Auto flow")} <span class="css-prop">(<code>grid-auto-flow</code>)</span></span>
                <sl-option value="row">row</sl-option>
                <sl-option value="row dense">row dense</sl-option>
                <sl-option value="column">column</sl-option>
                <sl-option value="column dense">column dense</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-select
                value=${grid.justifyItems ?? "stretch"}
                @sl-change=${(e: ControlEvent) =>
                  host.layout.setGridSettings({
                    justifyItems: e.target
                      .value as GridSettings["justifyItems"],
                  })}
              >
                <span slot="label">${host.msg("Justify items")} <span class="css-prop">(<code>justify-items</code>)</span></span>
                <sl-option value="stretch">stretch</sl-option>
                <sl-option value="start">start</sl-option>
                <sl-option value="center">center</sl-option>
                <sl-option value="end">end</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-select
                value=${grid.alignItems ?? "start"}
                @sl-change=${(e: ControlEvent) =>
                  host.layout.setGridSettings({
                    alignItems: e.target.value as GridSettings["alignItems"],
                  })}
              >
                <span slot="label">${host.msg("Align items")} <span class="css-prop">(<code>align-items</code>)</span></span>
                <sl-option value="start">start</sl-option>
                <sl-option value="center">center</sl-option>
                <sl-option value="end">end</sl-option>
                <sl-option value="stretch">stretch</sl-option>
              </sl-select>
            </div>
          </div>
        </sl-details>
      `,
    );
  }

  return null;
}

// ─── Component Settings ───────────────────────────────────────────────────────

export function renderSelectedComponentSettings(
  host: WebwriterWebsiteBuilder,
  options: { bare?: boolean } = {},
) {
  const isStudent = !host.isAuthorMode();
  if (isStudent && !host.showComponentSettingsInStudent) return null;

  const node = host.getSelectedNode();
  if (!node) return null;

  if (node.isContainer) {
    return renderContainerSettings(host, node);
  }

  const component = ComponentRegistry[node.type];
  if (!component) return null;

  const parentContainer = findParentNode(host.activeNodes, node.id);

  const custom = component.settings
    ? component.settings({
        data: node.data ?? {},
        setData: (patch) => {
          host.updateNode(node.id, {
            data: { ...(node.data ?? {}), ...patch },
          });
          host.requestUpdate();
        },
      }, host.msg)
    : null;

  const flowDisplayUI =
    host.layoutMode === "flow" && !parentContainer
      ? html`
          <div style="margin-top:1rem">
            <h2 style="margin-top:0">${host.msg("Flow")}</h2>
            <div class="setting-row">
              <sl-select
                value=${node.display ?? "block"}
                @sl-change=${(e: ControlEvent) =>
                  host.updateNode(node.id, {
                    display: e.target.value as "block" | "inline",
                  })}
              >
                <span slot="label">${host.msg("Display")} <span class="css-prop">(<code>display</code>)</span></span>
                <sl-option value="block">block</sl-option>
                <sl-option value="inline">inline</sl-option>
              </sl-select>
            </div>
          </div>
        `
      : null;

  const rootGridUI =
    host.layoutMode === "grid" && !parentContainer
      ? renderGridPlacementUI(host, node)
      : null;

  const flexItemUI =
    parentContainer?.containerLayout === "flex"
      ? renderFlexItemSettings(host, node, parentContainer)
      : null;

  const containerGridUI =
    parentContainer?.containerLayout === "grid"
      ? renderGridPlacementUI(host, node)
      : null;

  const resolvedBindings = component.bindings?.(host.msg);
  const bindingsUI = resolvedBindings?.length
    ? html`
        <div style="margin-top:1rem">
          <h2 style="margin-top:0">${host.msg("Content")}</h2>
          ${resolvedBindings.map((b) => {
            const current =
              node.data?.[b.key] == null ? "" : String(node.data[b.key]);
            return html`
              <div class="setting-row">
                <sl-input
                  label=${b.label}
                  .value=${current}
                  placeholder=${b.placeholder ?? ""}
                  @sl-input=${(e: CustomEvent) => {
                    const value = String((e.target as HTMLInputElement).value ?? "");
                    host.updateNode(node.id, {
                      data: { ...(node.data ?? {}), [b.key]: value },
                    });
                    host.requestUpdate();
                  }}
                ></sl-input>
              </div>
            `;
          })}
        </div>
      `
    : null;

  const content = html`
    ${custom ?? null} ${flowDisplayUI} ${rootGridUI} ${flexItemUI}
    ${containerGridUI} ${bindingsUI}
  `;

  if (options.bare) {
    return html`<div style="margin-top:1rem">${content}</div>`;
  }

  return html`
    <sl-details summary=${host.msg("Component")}>
      <div style="margin-top:1rem">${content}</div>
    </sl-details>
  `;
}

// ─── Grid Placement UI ────────────────────────────────────────────────────────

function renderGridPlacementUI(host: WebwriterWebsiteBuilder, node: BuilderNode) {
  const g = node.grid ?? {};
  const update = (patch: Partial<typeof g>) =>
    host.updateNode(node.id, { grid: { ...g, ...patch } });

  return html`
    <div style="margin-top:1rem">
      <h2 style="margin-top:0">${host.msg("Grid placement")}</h2>
      <div class="setting-row">
        <sl-input placeholder=${`${host.msg("e.g.")} hero`} .value=${String(g.area ?? "")} @sl-input=${(e: ControlEvent) => update({ area: String(e.target.value ?? "") })}>
          <span slot="label">${host.msg("Area")} <span class="css-prop">(<code>grid-area</code>)</span></span>
        </sl-input>
      </div>
      ${gridNumberInput(host.msg("Column start"), "grid-column-start", g.colStart, (v) => update({ colStart: v }))}
      ${gridNumberInput(host.msg("Column span"),  "grid-column",       g.colSpan,  (v) => update({ colSpan: v }))}
      ${gridNumberInput(host.msg("Row start"),    "grid-row-start",    g.rowStart, (v) => update({ rowStart: v }))}
      ${gridNumberInput(host.msg("Row span"),     "grid-row",          g.rowSpan,  (v) => update({ rowSpan: v }))}
    </div>
  `;
}

function gridNumberInput(label: string, property: string, value: number | undefined, onChange: (v: number | undefined) => void) {
  return html`
    <div class="setting-row">
      <sl-input
        placeholder="1"
        .value=${value != null ? String(value) : ""}
        @sl-input=${(e: ControlEvent) => {
          const v = Number(e.target.value);
          onChange(Number.isFinite(v) ? Math.max(1, v) : undefined);
        }}
      >
        <span slot="label">${label} <span class="css-prop">(<code>${property}</code>)</span></span>
      </sl-input>
    </div>
  `;
}

// ─── Flex Item Settings ───────────────────────────────────────────────────────

function renderFlexItemSettings(host: WebwriterWebsiteBuilder, node: BuilderNode, parent: BuilderNode) {
  const fi = node.flexItem ?? {};
  const set = (patch: Partial<FlexItemSettings>) =>
    host.updateNode(node.id, { flexItem: { ...fi, ...patch } });

  return html`
    <div style="margin-top:1rem">
      <h2 style="margin-top:0">${host.msg("Flex item")}</h2>
      <div style="font-size:0.78rem;color:var(--sl-color-neutral-500);margin-bottom:0.5rem;">
        ${host.msg("Parent direction:")} <strong>${parent.containerFlexSettings?.direction ?? "row"}</strong>
      </div>
      <div class="setting-row">
        <sl-select value=${fi.alignSelf ?? "auto"} @sl-change=${(e: ControlEvent) => set({ alignSelf: e.target.value as FlexItemSettings["alignSelf"] })}>
          <span slot="label">${host.msg("Align self")} <span class="css-prop">(<code>align-self</code>)</span></span>
          <sl-option value="auto">auto (${host.msg("inherit parent")})</sl-option>
          <sl-option value="flex-start">flex-start</sl-option>
          <sl-option value="center">center</sl-option>
          <sl-option value="flex-end">flex-end</sl-option>
          <sl-option value="stretch">stretch</sl-option>
          <sl-option value="baseline">baseline</sl-option>
        </sl-select>
      </div>
      ${flexNumberInput(host.msg("Flex grow"),   "flex-grow",   fi.flexGrow,   "0", (v) => set({ flexGrow: v }))}
      ${flexNumberInput(host.msg("Flex shrink"), "flex-shrink", fi.flexShrink, "1", (v) => set({ flexShrink: v }))}
      <div class="setting-row">
        <sl-input placeholder="auto" .value=${fi.flexBasis ?? ""} @sl-input=${(e: ControlEvent) => set({ flexBasis: String(e.target.value ?? "") || undefined })}>
          <span slot="label">${host.msg("Flex basis")} <span class="css-prop">(<code>flex-basis</code>)</span></span>
        </sl-input>
      </div>
    </div>
  `;
}

function flexNumberInput(label: string, property: string, value: number | undefined, placeholder: string, onChange: (v: number | undefined) => void) {
  return html`
    <div class="setting-row">
      <sl-input type="number" placeholder=${placeholder} min="0"
        .value=${value != null ? String(value) : ""}
        @sl-input=${(e: ControlEvent) => {
          const v = Number(e.target.value);
          onChange(Number.isFinite(v) ? Math.max(0, v) : undefined);
        }}
      >
        <span slot="label">${label} <span class="css-prop">(<code>${property}</code>)</span></span>
      </sl-input>
    </div>
  `;
}
