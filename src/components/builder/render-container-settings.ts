import { html } from "lit";
import type { WebwriterWebsiteBuilder } from "../../widgets/webwriter-website-builder";
import type {
  BuilderNode,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "../../model/types";
import { defaultFlexSettings, defaultGridSettings } from "../../model/types";

// ─── Container Settings ───────────────────────────────────────────────────────

export function renderContainerSettings(
  host: WebwriterWebsiteBuilder,
  node: BuilderNode,
) {
  const layout = node.containerLayout ?? "flex";
  return html`
    <sl-details summary=${host.msg("Container")} open>
      <div style="margin-top:1rem">
        <div
          style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;"
        >
          <h2 style="margin:0; font-size:0.95rem;">${host.msg("Container")}</h2>
          <sl-button
            size="small"
            variant="danger"
            outline
            @click=${() => host.layout.ungroupContainer(node.id)}
            >${host.msg("Ungroup")}</sl-button
          >
        </div>

        <div class="setting-row">
          <sl-select
            label=${host.msg("Container layout")}
            value=${layout}
            @sl-change=${(e: ControlEvent) =>
              host.updateNode(node.id, {
                containerLayout: e.target.value as LayoutMode,
              })}
          >
            <sl-option value="flow">${host.msg("Flow")}</sl-option>
            <sl-option value="flex">Flex</sl-option>
            <sl-option value="grid">${host.msg("Grid")}</sl-option>
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
      <sl-select value=${f.direction ?? "row"} @sl-change=${(e: ControlEvent) => set({ direction: e.target.value as FlexSettings["direction"] })}>
        <span slot="label">${host.msg("Direction")} <span class="css-prop">(<code>flex-direction</code>)</span></span>
        <sl-option value="row">row</sl-option>
        <sl-option value="column">column</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-select value=${f.justify ?? "flex-start"} @sl-change=${(e: ControlEvent) => set({ justify: e.target.value })}>
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
      <sl-select value=${f.align ?? "stretch"} @sl-change=${(e: ControlEvent) => set({ align: e.target.value })}>
        <span slot="label">${host.msg("Align items")} <span class="css-prop">(<code>align-items</code>)</span></span>
        <sl-option value="stretch">stretch</sl-option>
        <sl-option value="flex-start">flex-start</sl-option>
        <sl-option value="center">center</sl-option>
        <sl-option value="flex-end">flex-end</sl-option>
        <sl-option value="baseline">baseline</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-select value=${f.wrap ?? "nowrap"} @sl-change=${(e: ControlEvent) => set({ wrap: e.target.value as FlexSettings["wrap"] })}>
        <span slot="label">${host.msg("Wrap")} <span class="css-prop">(<code>flex-wrap</code>)</span></span>
        <sl-option value="nowrap">nowrap</sl-option>
        <sl-option value="wrap">wrap</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-input placeholder=${`${host.msg("e.g.")} 12px`} .value=${f.gap ?? "12px"} @sl-input=${(e: ControlEvent) => set({ gap: String(e.target.value ?? "") })}>
        <span slot="label">${host.msg("Gap")} <span class="css-prop">(<code>gap</code>)</span></span>
      </sl-input>
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
      <sl-input placeholder=${`${host.msg("e.g.")} repeat(3, 1fr)`} .value=${g.columns ?? "repeat(3, 1fr)"} @sl-input=${(e: ControlEvent) => set({ columns: String(e.target.value ?? "") })}>
        <span slot="label">${host.msg("Columns")} <span class="css-prop">(<code>grid-template-columns</code>)</span></span>
      </sl-input>
    </div>
    <div class="setting-row">
      <sl-input placeholder=${`${host.msg("e.g.")} auto`} .value=${g.rows ?? "auto"} @sl-input=${(e: ControlEvent) => set({ rows: String(e.target.value ?? "") })}>
        <span slot="label">${host.msg("Rows")} <span class="css-prop">(<code>grid-template-rows</code>)</span></span>
      </sl-input>
    </div>
    <div class="setting-row">
      <sl-input placeholder=${`${host.msg("e.g.")} 12px`} .value=${g.gap ?? "12px"} @sl-input=${(e: ControlEvent) => set({ gap: String(e.target.value ?? "") })}>
        <span slot="label">${host.msg("Gap")} <span class="css-prop">(<code>gap</code>)</span></span>
      </sl-input>
    </div>
    <div class="setting-row">
      <sl-select value=${g.autoFlow ?? "row"} @sl-change=${(e: ControlEvent) => set({ autoFlow: e.target.value as GridSettings["autoFlow"] })}>
        <span slot="label">${host.msg("Auto flow")} <span class="css-prop">(<code>grid-auto-flow</code>)</span></span>
        <sl-option value="row">row</sl-option>
        <sl-option value="row dense">row dense</sl-option>
        <sl-option value="column">column</sl-option>
        <sl-option value="column dense">column dense</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-select value=${g.justifyItems ?? "stretch"} @sl-change=${(e: ControlEvent) => set({ justifyItems: e.target.value as GridSettings["justifyItems"] })}>
        <span slot="label">${host.msg("Justify items")} <span class="css-prop">(<code>justify-items</code>)</span></span>
        <sl-option value="stretch">stretch</sl-option>
        <sl-option value="start">start</sl-option>
        <sl-option value="center">center</sl-option>
        <sl-option value="end">end</sl-option>
      </sl-select>
    </div>
    <div class="setting-row">
      <sl-select value=${g.alignItems ?? "start"} @sl-change=${(e: ControlEvent) => set({ alignItems: e.target.value as GridSettings["alignItems"] })}>
        <span slot="label">${host.msg("Align items")} <span class="css-prop">(<code>align-items</code>)</span></span>
        <sl-option value="start">start</sl-option>
        <sl-option value="center">center</sl-option>
        <sl-option value="end">end</sl-option>
        <sl-option value="stretch">stretch</sl-option>
      </sl-select>
    </div>
  `;
}
