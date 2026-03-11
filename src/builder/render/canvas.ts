import { html } from "lit";
import { repeat } from "lit/directives/repeat.js";
import type { WebwriterWebsiteBuilder } from "../../webwriter-website-builder";
import { sortedNodes } from "../layout";
import { ComponentRegistry } from "../../components/registry";
import type { BuilderNode } from "../types";
import { defaultFlexSettings, defaultGridSettings } from "../types";

/**
 * Canvas rendering: freeform, flow, flex, grid layouts and node wrappers.
 */
export function renderCanvasInner(host: WebwriterWebsiteBuilder) {
  const nodes = host.activeNodes;
  const bg = host.canvasBackground ?? "#ffffff";   // ← reads from host

  if (nodes.length === 0) {
    return html`<div class="drop-zone">drop components here</div>`;
  }

  if (host.layoutMode === "freeform") {
    return html`
      <div class="freeform-root">
        ${repeat(nodes, (n) => n.id, (n) => renderNodeFreeform(host, n))}
      </div>
    `;
  }

  if (host.layoutMode === "flow") {
    return html`
      <div class="flow-root">
        ${repeat(sortedNodes(nodes), (n) => n.id, (n) => renderNodeFlow(host, n))}
      </div>
    `;
  }

  if (host.layoutMode === "flex") {
    return html`
      <div class="flex-root" style="${host.layout.flexContainerStyle()};">
        ${repeat(sortedNodes(nodes), (n) => n.id, (n) => renderNodeFlow(host, n))}
      </div>
    `;
  }

  // Grid
  return html`
    <div class="grid-root" style="${host.layout.gridContainerStyle()};">
      ${repeat(sortedNodes(nodes), (n) => n.id, (n) => renderNodeFlow(host, n))}
    </div>
  `;
}

export function renderNodeFreeform(host: WebwriterWebsiteBuilder, n: BuilderNode) {
  const comp = n.isContainer ? null : ComponentRegistry[n.type];
  if (!comp && !n.isContainer) return null;

  const pos = n.pos ?? { x: 32, y: 32 };
  const selected = host.selectedNodeId === n.id || host.selectedIds.has(n.id);
  const zIdx = n.zIndex ?? 0;

  return html`
    <div
      class="builder-element ${selected ? "selected" : ""} ${n.isContainer ? "is-container" : ""}"
      data-node-id=${n.id}
      data-component-type=${n.type}
      style="position:absolute;left:${pos.x}px;top:${pos.y}px;cursor:grab;z-index:${zIdx};"
      @pointerdown=${(e: PointerEvent) => host.selection.onWrapperPointerDown(e, n.id)}
      @click=${(e: MouseEvent) => host.selection.onWrapperClick(e, n.id)}
      @dblclick=${(e: MouseEvent) => host.selection.handleNodeDblClick(e, n.id)}
    >
      <div class="drag-shell">
        ${n.isContainer
          ? renderContainerContent(host, n)
          : comp!.render(n.data ?? comp!.defaultData)}
      </div>
    </div>
  `;
}

export function renderNodeFlow(host: WebwriterWebsiteBuilder, n: BuilderNode) {
  const comp = n.isContainer ? null : ComponentRegistry[n.type];
  if (!comp && !n.isContainer) return null;

  const selected = host.selectedNodeId === n.id || host.selectedIds.has(n.id);
  const display = n.display ?? "block";
  const style = host.layoutMode === "grid" ? gridItemStyle(host, n) : "";

  return html`
    <div
      class="builder-element flow-item ${selected ? "selected" : ""} ${n.isContainer ? "is-container" : ""}"
      data-node-id=${n.id}
      data-component-type=${n.type}
      data-display=${display}
      style=${style}
      @pointerdown=${(e: PointerEvent) => host.selection.onWrapperPointerDown(e, n.id)}
      @click=${(e: MouseEvent) => host.selection.onWrapperClick(e, n.id)}
      @dblclick=${(e: MouseEvent) => host.selection.handleNodeDblClick(e, n.id)}
    >
      <div class="drag-shell">
        ${n.isContainer
          ? renderContainerContent(host, n)
          : comp!.render(n.data ?? comp!.defaultData)}
      </div>
    </div>
  `;
}

export function renderContainerContent(host: WebwriterWebsiteBuilder, n: BuilderNode) {
  const children = sortedNodes(n.children ?? []);
  const style = containerInlineStyle(n);
  const isEmpty = children.length === 0;

  return html`
    <div class="nested-container" style=${style}>
      ${isEmpty
        ? html`<div class="container-empty-hint">Empty container — add items via the sidebar</div>`
        : repeat(children, (c) => c.id, (c) => renderNestedNode(host, c, n))}
    </div>
  `;
}

export function renderNestedNode(
  host: WebwriterWebsiteBuilder,
  n: BuilderNode,
  parent: BuilderNode,
) {
  const comp = n.isContainer ? null : ComponentRegistry[n.type];
  if (!comp && !n.isContainer) return null;

  const selected = host.selectedNodeId === n.id;
  const parentIsFocused = host.focusedContainerId === parent.id;
  const display = n.display ?? "block";

  const gridStyle = parent.containerLayout === "grid" ? gridItemStyle(host, n) : "";
  const flexStyle = flexItemInlineStyle(n, parent);
  const combinedStyle = [gridStyle, flexStyle].filter(Boolean).join(";");

  return html`
    <div
      class="builder-element nested-item
        ${selected ? "selected" : ""}
        ${n.isContainer ? "is-container" : ""}
        ${parentIsFocused ? "drillable" : ""}"
      data-node-id=${n.id}
      data-component-type=${n.type}
      data-display=${display}
      style=${combinedStyle}
      @pointerdown=${(e: PointerEvent) => {
        if (parentIsFocused) {
          e.stopPropagation();
          host.selection.onWrapperPointerDown(e, n.id);
        }
      }}
      @click=${(e: MouseEvent) => {
        if (parentIsFocused) {
          e.stopPropagation();
          host.selection.onWrapperClick(e, n.id);
        }
      }}
      @dblclick=${(e: MouseEvent) => {
        if (n.isContainer) host.selection.handleNodeDblClick(e, n.id);
      }}
    >
      <div class="drag-shell">
        ${n.isContainer
          ? renderContainerContent(host, n)
          : comp!.render(n.data ?? comp!.defaultData)}
      </div>
    </div>
  `;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

export function gridItemStyle(host: WebwriterWebsiteBuilder, n: BuilderNode): string {
  if (host.layoutMode !== "grid" && n.grid == null) return "";
  const g = n.grid ?? {};
  const css: string[] = [];

  const area = (g.area ?? "").trim();
  if (area) {
    css.push(`grid-area:${area}`);
  } else {
    if (typeof g.colStart === "number") {
      css.push(`grid-column:${g.colStart} / span ${Math.max(1, Number(g.colSpan ?? 1))}`);
    } else if (typeof g.colSpan === "number") {
      css.push(`grid-column:span ${Math.max(1, g.colSpan)}`);
    }
    if (typeof g.rowStart === "number") {
      css.push(`grid-row:${g.rowStart} / span ${Math.max(1, Number(g.rowSpan ?? 1))}`);
    } else if (typeof g.rowSpan === "number") {
      css.push(`grid-row:span ${Math.max(1, g.rowSpan)}`);
    }
  }
  if (g.justifySelf) css.push(`justify-self:${g.justifySelf}`);
  if (g.alignSelf) css.push(`align-self:${g.alignSelf}`);
  return css.join(";");
}

export function flexItemInlineStyle(n: BuilderNode, parent: BuilderNode): string {
  if (parent.containerLayout !== "flex") return "";
  const fi = n.flexItem;
  if (!fi) return "";
  const parts: string[] = [];
  if (fi.flexGrow != null) parts.push(`flex-grow:${fi.flexGrow}`);
  if (fi.flexShrink != null) parts.push(`flex-shrink:${fi.flexShrink}`);
  if (fi.flexBasis) parts.push(`flex-basis:${fi.flexBasis}`);
  if (fi.alignSelf) parts.push(`align-self:${fi.alignSelf}`);
  return parts.join(";");
}

export function containerInlineStyle(n: BuilderNode): string {
  const layout = n.containerLayout ?? "flex";
  const parts: string[] = [];

  if (layout === "flex") {
    const f = n.containerFlexSettings ?? defaultFlexSettings();
    parts.push(
      `display:flex`,
      `flex-direction:${f.direction ?? "row"}`,
      `justify-content:${f.justify ?? "flex-start"}`,
      `align-items:${f.align ?? "stretch"}`,
      `flex-wrap:${f.wrap ?? "nowrap"}`,
      `gap:${f.gap ?? "12px"}`,
    );
  } else if (layout === "grid") {
    const g = n.containerGridSettings ?? defaultGridSettings();
    parts.push(
      `display:grid`,
      `grid-template-columns:${g.columns ?? "repeat(3,1fr)"}`,
      `grid-auto-rows:${g.rows ?? "auto"}`,
      `gap:${g.gap ?? "12px"}`,
      `grid-auto-flow:${g.autoFlow ?? "row"}`,
      `justify-items:${g.justifyItems ?? "stretch"}`,
      `align-items:${g.alignItems ?? "start"}`,
    );
  }
  return parts.join(";");
}