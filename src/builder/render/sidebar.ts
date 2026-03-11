// ─── ADD THIS BLOCK inside renderLayersPanel (or renderVisibilitySettings),
// under the "Canvas" sl-details in webwriter-website-builder.ts render() ──────
//
// In webwriter-website-builder.ts render(), find the sl-details summary="Canvas" block.
// Replace the inner content with the updated version from renderLayersPanel below,
// which now includes the background color picker.
//
// Also in sidebar.ts, renderLayersPanel now accepts the full host and renders
// the background color row regardless of layoutMode (moved outside the freeform guard).
// ─────────────────────────────────────────────────────────────────────────────

import { html } from "lit";
import { keyed } from "lit/directives/keyed.js";
import { msg } from "@lit/localize";
import type { WebwriterWebsiteBuilder } from "../../webwriter-website-builder";
import { ComponentRegistry } from "../../components/registry";
import type {
  BuilderNode,
  CodeTab,
  FlexItemSettings,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "../types";
import { defaultFlexSettings, defaultGridSettings } from "../types";
import { tileGlyph } from "../palette-helpers";

// ─── Visibility Settings ──────────────────────────────────────────────────────

export function renderVisibilitySettings(host: WebwriterWebsiteBuilder) {
  if (!host.isContentEditable) return null;
  const isStudent = !host.isContentEditable;

  return html`
    <sl-details summary="Visibility">
      <div class="vis-section">
        <div class="vis-section-label">
          <sl-icon name="layout-three-columns"></sl-icon>
          Layout modes
        </div>
        <div class="vis-chips">
          ${layoutModeChip(host, "freeform", "Freeform", "arrows-move")}
          ${layoutModeChip(host, "flow", "Flow", "arrow-down")}
          ${layoutModeChip(host, "flex", "Flex", "distribute-horizontal")}
          ${layoutModeChip(host, "grid", "Grid", "grid")}
        </div>
      </div>

      <div class="vis-section">
        <div class="vis-section-label">
          <sl-icon name="code-slash"></sl-icon>
          Code tabs
        </div>
        <div class="vis-chips">
          ${codeTabChip(host, "combined", "Combined")}
          ${codeTabChip(host, "html", "HTML")}
          ${codeTabChip(host, "css", "CSS")}
        </div>
      </div>

      <div class="vis-section">
        <div class="vis-section-label">
          <sl-icon name="person"></sl-icon>
          Student mode
        </div>

        <div class="vis-switch-row">
          <span class="vis-switch-label">Show component settings</span>
          <sl-switch
            size="small"
            .checked=${host.showComponentSettingsInStudent}
            @sl-change=${(e: CustomEvent) => {
              host.showComponentSettingsInStudent = Boolean(
                (e.currentTarget as any).checked,
              );
              host.requestUpdate();
            }}
          ></sl-switch>
        </div>

        <div class="vis-switch-row">
          <span class="vis-switch-label">Show sidebar</span>
          <sl-switch
            size="small"
            .checked=${host.showSidebarInStudent}
            @sl-change=${(e: CustomEvent) => {
              host.showSidebarInStudent = Boolean(
                (e.currentTarget as any).checked,
              );
              host.requestUpdate();
            }}
          ></sl-switch>
        </div>

        <div class="vis-switch-row">
          <span class="vis-switch-label">Show toolbar</span>
          <sl-switch
            size="small"
            .checked=${host.showToolbarInStudent}
            @sl-change=${(e: CustomEvent) => {
              host.showToolbarInStudent = Boolean(
                (e.currentTarget as any).checked,
              );
              host.requestUpdate();
            }}
          ></sl-switch>
        </div>

        <div class="vis-switch-row">
          <span class="vis-switch-label">Allow delete</span>
          <sl-switch
            size="small"
            .checked=${host.allowDeleteInStudent}
            @sl-change=${(e: CustomEvent) => {
              host.allowDeleteInStudent = Boolean(
                (e.currentTarget as any).checked,
              );
              host.requestUpdate();
            }}
          ></sl-switch>
        </div>

        <div class="vis-mode-badge">
          <sl-icon name=${isStudent ? "mortarboard" : "pencil"}></sl-icon>
          ${isStudent ? "Student mode" : "Author mode"}
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
      <sl-icon name=${icon} style="font-size:10px;flex-shrink:0;"></sl-icon>
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
        <sl-details summary="Layout">
          <div style="margin-top: 1rem">
            <div class="setting-row">
              <sl-select
                label="Direction"
                value=${flex.direction ?? "row"}
                @sl-change=${(e: any) =>
                  host.layout.setFlexSettings({
                    direction: e.target.value as FlexSettings["direction"],
                  })}
              >
                <sl-option value="row">row</sl-option>
                <sl-option value="column">column</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-select
                label="Justify content"
                value=${flex.justify ?? "flex-start"}
                @sl-change=${(e: any) =>
                  host.layout.setFlexSettings({ justify: e.target.value })}
              >
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
                label="Align items"
                value=${flex.align ?? "stretch"}
                @sl-change=${(e: any) =>
                  host.layout.setFlexSettings({ align: e.target.value })}
              >
                <sl-option value="stretch">stretch</sl-option>
                <sl-option value="flex-start">flex-start</sl-option>
                <sl-option value="center">center</sl-option>
                <sl-option value="flex-end">flex-end</sl-option>
                <sl-option value="baseline">baseline</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-select
                label="Wrap"
                value=${flex.wrap ?? "nowrap"}
                @sl-change=${(e: any) =>
                  host.layout.setFlexSettings({
                    wrap: e.target.value as FlexSettings["wrap"],
                  })}
              >
                <sl-option value="nowrap">nowrap</sl-option>
                <sl-option value="wrap">wrap</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-input
                label="Gap"
                placeholder="e.g. 12px"
                .value=${flex.gap ?? "12px"}
                @sl-input=${(e: any) =>
                  host.layout.setFlexSettings({
                    gap: String(e.target.value ?? ""),
                  })}
              ></sl-input>
            </div>
          </div>
        </sl-details>
      `,
    );
  }

  if (host.layoutMode === "grid") {
    const grid = host.gridSettings;
    return keyed(
      "layout-grid",
      html`
        <sl-details summary="Layout">
          <div style="margin-top: 1rem">

            <div class="setting-row">
              <sl-input
                label="Columns"
                placeholder="e.g. repeat(3, 1fr)"
                .value=${grid.columns ?? "repeat(3, 1fr)"}
                @sl-input=${(e: any) =>
                  host.layout.setGridSettings({
                    columns: String(e.target.value ?? ""),
                  })}
              ></sl-input>
            </div>

            <div class="setting-row">
              <sl-input
                label="Rows"
                placeholder="e.g. auto"
                .value=${grid.rows ?? "auto"}
                @sl-input=${(e: any) =>
                  host.layout.setGridSettings({
                    rows: String(e.target.value ?? ""),
                  })}
              ></sl-input>
            </div>

            <div class="setting-row">
              <sl-input
                label="Gap"
                placeholder="e.g. 12px"
                .value=${grid.gap ?? "12px"}
                @sl-input=${(e: any) =>
                  host.layout.setGridSettings({
                    gap: String(e.target.value ?? ""),
                  })}
              ></sl-input>
            </div>

            <div class="setting-row">
              <sl-select
                label="Auto flow"
                value=${grid.autoFlow ?? "row"}
                @sl-change=${(e: any) =>
                  host.layout.setGridSettings({
                    autoFlow: e.target.value as GridSettings["autoFlow"],
                  })}
              >
                <sl-option value="row">row</sl-option>
                <sl-option value="row dense">row dense</sl-option>
                <sl-option value="column">column</sl-option>
                <sl-option value="column dense">column dense</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-select
                label="Justify items"
                value=${grid.justifyItems ?? "stretch"}
                @sl-change=${(e: any) =>
                  host.layout.setGridSettings({
                    justifyItems: e.target
                      .value as GridSettings["justifyItems"],
                  })}
              >
                <sl-option value="stretch">stretch</sl-option>
                <sl-option value="start">start</sl-option>
                <sl-option value="center">center</sl-option>
                <sl-option value="end">end</sl-option>
              </sl-select>
            </div>

            <div class="setting-row">
              <sl-select
                label="Align items"
                value=${grid.alignItems ?? "start"}
                @sl-change=${(e: any) =>
                  host.layout.setGridSettings({
                    alignItems: e.target.value as GridSettings["alignItems"],
                  })}
              >
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

export function renderSelectedComponentSettings(host: WebwriterWebsiteBuilder) {
  const isStudent = !host.isContentEditable;
  if (isStudent && !host.showComponentSettingsInStudent) return null;

  const node = host.getSelectedNode();
  if (!node) return null;

  if (node.isContainer) {
    return renderContainerSettings(host, node);
  }

  const component = ComponentRegistry[node.type];
  if (!component) return null;

  const parentContainer = findParentContainer(host, node.id);

  const custom = component.settings
    ? component.settings({
        data: node.data ?? {},
        setData: (patch) => {
          host.setActiveNodes(
            host.activeNodes.map((n) =>
              n.id === node.id
                ? { ...n, data: { ...(node.data ?? {}), ...patch } }
                : n,
            ),
          );
          host.requestUpdate();
        },
      })
    : null;

  const flowDisplayUI =
    host.layoutMode === "flow" && !parentContainer
      ? html`
          <div style="margin-top:1rem">
            <h2 style="margin-top:0">${msg("Flow")}</h2>
            <div class="setting-row">
              <sl-select
                label="Display"
                value=${node.display ?? "block"}
                @sl-change=${(e: any) =>
                  host.updateNode(node.id, {
                    display: e.target.value as "block" | "inline",
                  })}
              >
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

  const bindingsUI = component.bindings?.length
    ? html`
        <div style="margin-top:1rem">
          <h2 style="margin-top:0">${msg("Content")}</h2>
          ${component.bindings.map((b) => {
            const current =
              node.data?.[b.key] == null ? "" : String(node.data[b.key]);
            return html`
              <div class="setting-row">
                <sl-input
                  label=${b.label}
                  .value=${current}
                  placeholder=${b.placeholder ?? ""}
                  @sl-input=${(e: CustomEvent) => {
                    const value = String((e.target as any).value ?? "");
                    host.setActiveNodes(
                      host.activeNodes.map((n) => {
                        if (n.id !== node.id) return n;
                        return {
                          ...n,
                          data: { ...(n.data ?? {}), [b.key]: value },
                        };
                      }),
                    );
                    host.requestUpdate();
                  }}
                ></sl-input>
              </div>
            `;
          })}
        </div>
      `
    : null;

  return html`
    <sl-details summary="Component">
      <div style="margin-top:1rem">
        ${custom ?? null} ${flowDisplayUI} ${rootGridUI} ${flexItemUI}
        ${containerGridUI} ${bindingsUI}
      </div>
    </sl-details>
  `;
}

// ─── Container Settings ───────────────────────────────────────────────────────

function renderContainerSettings(
  host: WebwriterWebsiteBuilder,
  node: BuilderNode,
) {
  const layout = node.containerLayout ?? "flex";
  return html`
    <sl-details summary="Container" open>
      <div style="margin-top:1rem">
        <div
          style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;"
        >
          <h2 style="margin:0; font-size:0.95rem;">Container</h2>
          <sl-button
            size="small"
            variant="danger"
            outline
            @click=${() => host.ungroupContainer(node.id)}
            >Ungroup</sl-button
          >
        </div>

        <div class="setting-row">
          <sl-select
            label="Container layout"
            value=${layout}
            @sl-change=${(e: any) =>
              host.updateNode(node.id, {
                containerLayout: e.target.value as LayoutMode,
              })}
          >
            <sl-option value="flow">Flow</sl-option>
            <sl-option value="flex">Flex</sl-option>
            <sl-option value="grid">Grid</sl-option>
          </sl-select>
        </div>

        ${layout === "flex" ? renderContainerFlexSettings(host, node) : null}
        ${layout === "grid" ? renderContainerGridSettings(host, node) : null}
      </div>
    </sl-details>
  `;
}

function renderContainerFlexSettings(
  host: WebwriterWebsiteBuilder,
  node: BuilderNode,
) {
  const f = node.containerFlexSettings ?? defaultFlexSettings();
  const set = (patch: Partial<FlexSettings>) =>
    host.updateNode(node.id, { containerFlexSettings: { ...f, ...patch } });

  return html`
    <div class="setting-row">
      <sl-select label="Direction" value=${f.direction ?? "row"} @sl-change=${(e: any) => set({ direction: e.target.value as FlexSettings["direction"] })}>
        <sl-option value="row">row</sl-option>
        <sl-option value="column">column</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-select label="Justify content" value=${f.justify ?? "flex-start"} @sl-change=${(e: any) => set({ justify: e.target.value })}>
        <sl-option value="flex-start">flex-start</sl-option>
        <sl-option value="center">center</sl-option>
        <sl-option value="flex-end">flex-end</sl-option>
        <sl-option value="space-between">space-between</sl-option>
        <sl-option value="space-around">space-around</sl-option>
        <sl-option value="space-evenly">space-evenly</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-select label="Align items" value=${f.align ?? "stretch"} @sl-change=${(e: any) => set({ align: e.target.value })}>
        <sl-option value="stretch">stretch</sl-option>
        <sl-option value="flex-start">flex-start</sl-option>
        <sl-option value="center">center</sl-option>
        <sl-option value="flex-end">flex-end</sl-option>
        <sl-option value="baseline">baseline</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-select label="Wrap" value=${f.wrap ?? "nowrap"} @sl-change=${(e: any) => set({ wrap: e.target.value as FlexSettings["wrap"] })}>
        <sl-option value="nowrap">nowrap</sl-option>
        <sl-option value="wrap">wrap</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-input label="Gap" placeholder="e.g. 12px" .value=${f.gap ?? "12px"} @sl-input=${(e: any) => set({ gap: String(e.target.value ?? "") })}></sl-input>
    </div>
  `;
}

function renderContainerGridSettings(
  host: WebwriterWebsiteBuilder,
  node: BuilderNode,
) {
  const g = node.containerGridSettings ?? defaultGridSettings();
  const set = (patch: Partial<GridSettings>) =>
    host.updateNode(node.id, { containerGridSettings: { ...g, ...patch } });

  return html`
    <div class="setting-row">
      <sl-input label="Columns" placeholder="e.g. repeat(3, 1fr)" .value=${g.columns ?? "repeat(3, 1fr)"} @sl-input=${(e: any) => set({ columns: String(e.target.value ?? "") })}></sl-input>
    </div>
    <div class="setting-row">
      <sl-input label="Rows" placeholder="e.g. auto" .value=${g.rows ?? "auto"} @sl-input=${(e: any) => set({ rows: String(e.target.value ?? "") })}></sl-input>
    </div>
    <div class="setting-row">
      <sl-input label="Gap" placeholder="e.g. 12px" .value=${g.gap ?? "12px"} @sl-input=${(e: any) => set({ gap: String(e.target.value ?? "") })}></sl-input>
    </div>
    <div class="setting-row">
      <sl-select label="Auto flow" value=${g.autoFlow ?? "row"} @sl-change=${(e: any) => set({ autoFlow: e.target.value as GridSettings["autoFlow"] })}>
        <sl-option value="row">row</sl-option>
        <sl-option value="row dense">row dense</sl-option>
        <sl-option value="column">column</sl-option>
        <sl-option value="column dense">column dense</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-select label="Justify items" value=${g.justifyItems ?? "stretch"} @sl-change=${(e: any) => set({ justifyItems: e.target.value as GridSettings["justifyItems"] })}>
        <sl-option value="stretch">stretch</sl-option>
        <sl-option value="start">start</sl-option>
        <sl-option value="center">center</sl-option>
        <sl-option value="end">end</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-select label="Align items" value=${g.alignItems ?? "start"} @sl-change=${(e: any) => set({ alignItems: e.target.value as GridSettings["alignItems"] })}>
        <sl-option value="start">start</sl-option>
        <sl-option value="center">center</sl-option>
        <sl-option value="end">end</sl-option>
        <sl-option value="stretch">stretch</sl-option>
      </sl-select>
    </div>
  `;
}

// ─── Grid Placement UI ────────────────────────────────────────────────────────

function renderGridPlacementUI(host: WebwriterWebsiteBuilder, node: BuilderNode) {
  const g = node.grid ?? {};
  const update = (patch: Partial<typeof g>) =>
    host.updateNode(node.id, { grid: { ...g, ...patch } });

  return html`
    <div style="margin-top:1rem">
      <h2 style="margin-top:0">Grid placement</h2>
      <div class="setting-row">
        <sl-input label="Area (optional)" placeholder="e.g. hero" .value=${String(g.area ?? "")} @sl-input=${(e: any) => update({ area: String(e.target.value ?? "") })}></sl-input>
      </div>
      ${gridNumberInput("Column start", g.colStart, (v) => update({ colStart: v }))}
      ${gridNumberInput("Column span",  g.colSpan,  (v) => update({ colSpan: v }))}
      ${gridNumberInput("Row start",    g.rowStart, (v) => update({ rowStart: v }))}
      ${gridNumberInput("Row span",     g.rowSpan,  (v) => update({ rowSpan: v }))}
    </div>
  `;
}

function gridNumberInput(label: string, value: number | undefined, onChange: (v: number | undefined) => void) {
  return html`
    <div class="setting-row">
      <sl-input
        label=${label}
        placeholder="1"
        .value=${value != null ? String(value) : ""}
        @sl-input=${(e: any) => {
          const v = Number(e.target.value);
          onChange(Number.isFinite(v) ? Math.max(1, v) : undefined);
        }}
      ></sl-input>
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
      <h2 style="margin-top:0">Flex item</h2>
      <div style="font-size:0.78rem;color:var(--sl-color-neutral-500);margin-bottom:0.5rem;">
        Parent direction: <strong>${parent.containerFlexSettings?.direction ?? "row"}</strong>
      </div>
      <div class="setting-row">
        <sl-select label="Align self" value=${fi.alignSelf ?? "auto"} @sl-change=${(e: any) => set({ alignSelf: e.target.value as FlexItemSettings["alignSelf"] })}>
          <sl-option value="auto">auto (inherit parent)</sl-option>
          <sl-option value="flex-start">flex-start</sl-option>
          <sl-option value="center">center</sl-option>
          <sl-option value="flex-end">flex-end</sl-option>
          <sl-option value="stretch">stretch</sl-option>
          <sl-option value="baseline">baseline</sl-option>
        </sl-select>
      </div>
      ${flexNumberInput("Flex grow",   fi.flexGrow,   "0", (v) => set({ flexGrow: v }))}
      ${flexNumberInput("Flex shrink", fi.flexShrink, "1", (v) => set({ flexShrink: v }))}
      <div class="setting-row">
        <sl-input label="Flex basis" placeholder="auto" .value=${fi.flexBasis ?? ""} @sl-input=${(e: any) => set({ flexBasis: String(e.target.value ?? "") || undefined })}></sl-input>
      </div>
    </div>
  `;
}

function flexNumberInput(label: string, value: number | undefined, placeholder: string, onChange: (v: number | undefined) => void) {
  return html`
    <div class="setting-row">
      <sl-input label=${label} type="number" placeholder=${placeholder} min="0"
        .value=${value != null ? String(value) : ""}
        @sl-input=${(e: any) => {
          const v = Number(e.target.value);
          onChange(Number.isFinite(v) ? Math.max(0, v) : undefined);
        }}
      ></sl-input>
    </div>
  `;
}

// ─── Layers Panel + Background Color ─────────────────────────────────────────
// This is the full renderLayersPanel — it now always renders the background
// color picker, and renders the layers list only in freeform + author mode.

export function renderLayersPanel(host: WebwriterWebsiteBuilder) {
  const bg = host.canvasBackground ?? "#ffffff";

  // Background color presets
  const presets = [
    { label: "White",     value: "#ffffff" },
    { label: "Off-white", value: "#f8fafc" },
    { label: "Light grey",value: "#f1f5f9" },
    { label: "Dark",      value: "#0f172a" },
    { label: "Midnight",  value: "#1e293b" },
    { label: "Charcoal",  value: "#18181b" },
  ];

  const bgSection = html`
    <div style="margin-bottom: 0.75rem;">
      <div style="font-size:0.8rem;color:var(--sl-color-neutral-600);margin-bottom:0.4rem;font-weight:600;">
        Background color
      </div>

      <!-- Color input row: swatch + hex input + reset -->
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;">
        <!-- Native color picker -->
        <input
          type="color"
          .value=${bg}
          @input=${(e: Event) => {
            host.canvasBackground = (e.target as HTMLInputElement).value;
            host.requestUpdate();
          }}
          style="
            width: 32px; height: 32px;
            border: 1px solid var(--sl-color-neutral-300);
            border-radius: 6px;
            padding: 2px;
            cursor: pointer;
            background: none;
            flex-shrink: 0;
          "
        />

        <!-- Hex text input -->
        <sl-input
          size="small"
          placeholder="#ffffff"
          .value=${bg}
          @sl-input=${(e: any) => {
            const val = String(e.target.value ?? "").trim();
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
              host.canvasBackground = val;
              host.requestUpdate();
            }
          }}
          style="flex:1;"
        ></sl-input>

        <!-- Reset to white -->
        <sl-button
          size="small"
          variant="default"
          title="Reset to white"
          @click=${() => {
            host.canvasBackground = "#ffffff";
            host.requestUpdate();
          }}
        >
          <sl-icon name="arrow-counterclockwise"></sl-icon>
        </sl-button>
      </div>

      <!-- Preset swatches -->
      <div style="display:flex;gap:5px;flex-wrap:wrap;">
        ${presets.map(
          (p) => html`
            <button
              type="button"
              title=${p.label}
              @click=${() => {
                host.canvasBackground = p.value;
                host.requestUpdate();
              }}
              style="
                width: 22px; height: 22px;
                border-radius: 4px;
                border: 2px solid ${bg === p.value
                  ? "var(--sl-color-primary-600)"
                  : "var(--sl-color-neutral-300)"};
                background: ${p.value};
                cursor: pointer;
                padding: 0;
                flex-shrink: 0;
                box-shadow: ${bg === p.value ? "0 0 0 1px var(--sl-color-primary-300)" : "none"};
              "
            ></button>
          `,
        )}
      </div>
    </div>
  `;

  // Layers list: only in freeform + author mode (unchanged from original)
  if (host.layoutMode !== "freeform" || !host.isContentEditable) {
    return bgSection;
  }

  const nodes = [...host.freeformNodes].sort(
    (a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0),
  );

  return html`
    ${bgSection}

    <sl-details summary="Layers" style="margin-top:0.25rem;">
      <div style="font-size:0.78rem;color:var(--sl-color-neutral-600);margin-bottom:0.5rem;">
        Higher = in front. Click to select.
      </div>
      ${nodes.map((n) => {
        const comp = n.isContainer ? null : ComponentRegistry[n.type];
        const label = comp?.label ?? n.type;
        const selected = host.selectedNodeId === n.id;
        const zIdx = n.zIndex ?? 0;

        return html`
          <div
            class="layer-row ${selected ? "layer-row--selected" : ""}"
            @click=${() => host.selectNodeId(n.id)}
          >
            <span class="layer-glyph">${tileGlyph(n.type)}</span>
            <span class="layer-label">${label}</span>
            <div class="layer-z-controls">
              <button class="layer-z-btn" title="Bring forward"
                @click=${(e: MouseEvent) => { e.stopPropagation(); host.updateNode(n.id, { zIndex: zIdx + 1 }); }}>▲</button>
              <span class="layer-z-val">${zIdx}</span>
              <button class="layer-z-btn" title="Send back"
                @click=${(e: MouseEvent) => { e.stopPropagation(); host.updateNode(n.id, { zIndex: Math.max(0, zIdx - 1) }); }}>▼</button>
            </div>
          </div>
        `;
      })}
    </sl-details>
  `;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function findParentContainer(host: WebwriterWebsiteBuilder, nodeId: string): BuilderNode | null {
  const search = (nodes: BuilderNode[], targetId: string): BuilderNode | null => {
    for (const n of nodes) {
      if (n.children?.some((c) => c.id === targetId)) return n;
      if (n.children?.length) {
        const found = search(n.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };
  return search(host.activeNodes, nodeId);
}