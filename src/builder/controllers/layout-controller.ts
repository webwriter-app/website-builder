import type { WebwriterWebsiteBuilder } from "../../webwriter-website-builder";
import {
  convertFreeformToOrdered,
  convertOrderedToFreeform,
} from "../layout";
import type { LayoutMode, FlexSettings, GridSettings } from "../types";

/**
 * Handles layout mode switching and global flex/grid settings.
 */
export class LayoutController {
  private host: WebwriterWebsiteBuilder;

  constructor(host: WebwriterWebsiteBuilder) {
    this.host = host;
  }

  setLayoutMode(next: LayoutMode) {
    if (this.host.layoutMode === next) return;
    if (!this.host.visibleLayoutModes[next]) return;

    if (
      next !== "freeform" &&
      this.host.orderedNodes.length === 0 &&
      this.host.freeformNodes.length
    ) {
      this.host.orderedNodes = convertFreeformToOrdered(this.host.freeformNodes);
    }

    if (
      next === "freeform" &&
      this.host.freeformNodes.length === 0 &&
      this.host.orderedNodes.length
    ) {
      this.host.freeformNodes = convertOrderedToFreeform(this.host.orderedNodes);
    }

    this.host.layoutMode = next;
    this.host.clearSelection();
    this.host.requestUpdate();
  }

  setFlexSettings(patch: Partial<FlexSettings>) {
    this.host.flexSettings = { ...this.host.flexSettings, ...patch };
    this.host.requestUpdate();
  }

  setGridSettings(patch: Partial<GridSettings>) {
    this.host.gridSettings = { ...this.host.gridSettings, ...patch };
    this.host.requestUpdate();
  }

  setLayoutModeVisible(mode: LayoutMode, visible: boolean) {
    const next = { ...this.host.visibleLayoutModes, [mode]: visible };
    if (!Object.values(next).some(Boolean)) return; // keep at least one visible

    this.host.visibleLayoutModes = next;

    if (!this.host.visibleLayoutModes[this.host.layoutMode]) {
      const fallback = (Object.keys(this.host.visibleLayoutModes) as LayoutMode[]).find(
        (m) => this.host.visibleLayoutModes[m],
      );
      if (fallback) this.setLayoutMode(fallback);
    }

    this.host.requestUpdate();
  }

  flexContainerStyle(): string {
    const f = this.host.flexSettings;
    return [
      `flex-direction:${f.direction ?? "row"}`,
      `justify-content:${f.justify ?? "flex-start"}`,
      `align-items:${f.align ?? "stretch"}`,
      `flex-wrap:${f.wrap ?? "nowrap"}`,
      `gap:${f.gap ?? "12px"}`,
    ].join(";");
  }

  gridContainerStyle(): string {
    const g = this.host.gridSettings;
    return [
      `grid-template-columns:${g.columns ?? "repeat(3,1fr)"}`,
      `grid-auto-rows:${g.rows ?? "auto"}`,
      `gap:${g.gap ?? "12px"}`,
      `grid-auto-flow:${g.autoFlow ?? "row"}`,
      `justify-items:${g.justifyItems ?? "stretch"}`,
      `align-items:${g.alignItems ?? "start"}`,
    ].join(";");
  }

  gridPlacementFromPointer(root: HTMLElement, clientX: number, clientY: number) {
    const cs = getComputedStyle(root);
    const cols =
      cs.gridTemplateColumns.split(" ").filter((t) => t.trim().length > 0).length || 1;

    const r = root.getBoundingClientRect();
    const relX = Math.max(0, Math.min(clientX - r.left, r.width - 1));
    const relY = Math.max(0, clientY - r.top);

    const colW = r.width / cols;
    const colStart = Math.max(1, Math.min(cols, Math.floor(relX / colW) + 1));

    const autoRows = cs.gridAutoRows;
    const px = autoRows.endsWith("px") ? parseFloat(autoRows) : NaN;
    const rowH = Number.isFinite(px) && px > 0 ? px : 160;
    const rowStart = Math.max(1, Math.floor(relY / rowH) + 1);

    return { colStart, rowStart, colSpan: 1, rowSpan: 1 };
  }
}