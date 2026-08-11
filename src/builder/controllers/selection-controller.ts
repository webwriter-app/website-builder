import type { WebwriterWebsiteBuilder } from "../../webwriter-website-builder";
import { findNodeById } from "../layout";

/**
 * Handles node selection, multi-select, drill-in (double-click), and canvas click.
 */
export class SelectionController {
  private host: WebwriterWebsiteBuilder;

  constructor(host: WebwriterWebsiteBuilder) {
    this.host = host;
  }

  handleNodeSelect(e: PointerEvent | MouseEvent, nodeId: string) {
    if (this.host.shiftPressed) {
      this.toggleInSelection(nodeId);
      return;
    }

    this.host.selectedIds = new Set([nodeId]);
    this.host.selectNodeId(nodeId);

    const focusedContainer = this.host.focusedContainerId
      ? findNodeById(this.host.activeNodes, this.host.focusedContainerId)
      : null;
    const isChildOfFocused =
      focusedContainer?.children?.some((c) => c.id === nodeId) ?? false;
    const isFocusedContainer = nodeId === this.host.focusedContainerId;

    if (!isChildOfFocused && !isFocusedContainer) {
      this.host.focusedContainerId = null;
    }
    this.host.requestUpdate();
  }

  /** Toggles a node's membership in the multi-selection */
  private toggleInSelection(nodeId: string) {
    const rootIds = new Set(this.host.activeNodes.map((n) => n.id));
    if (!rootIds.has(nodeId)) return;

    const next = new Set(this.host.selectedIds);
    if (next.has(nodeId)) next.delete(nodeId);
    else next.add(nodeId);

    this.host.selectedNodeId = next.size > 0 ? nodeId : null;
    this.host.selectedIds = next;
    this.host.focusedContainerId = null;
    this.host.requestUpdate();
  }

  handleNodeDblClick(e: MouseEvent, nodeId: string) {
    e.stopPropagation();
    const node = findNodeById(this.host.activeNodes, nodeId);
    if (!node?.isContainer) return;

    this.host.focusedContainerId = nodeId;
    this.host.selectedIds = new Set([nodeId]);
    this.host.selectNodeId(nodeId);
    this.host.requestUpdate();
  }

  onCanvasClick(e: MouseEvent) {
    this.host.layoutDropdownOpen = false;
    this.host.blurActive();

    const path = e.composedPath() as EventTarget[];
    const clickedElement = path.find(
      (p) =>
        p instanceof HTMLElement && p.classList?.contains("builder-element"),
    ) as HTMLElement | undefined;

    if (!clickedElement) {
      this.host.clearSelection();
    }
  }

  onWrapperClick(e: MouseEvent, _nodeId: string) {
    const interactive = this.host.isInteractiveTarget(e.target);
    const allowInteract = this.host.allowInteractEvent(e);
    if (interactive && allowInteract) return;
    if (interactive && !allowInteract) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  onWrapperPointerDown(e: PointerEvent, nodeId: string) {
    const interactive = this.host.isInteractiveTarget(e.target);
    const allowInteract = this.host.allowInteractEvent(e);

    if (interactive && allowInteract) return;
    if (interactive && !allowInteract) {
      e.preventDefault();
      e.stopPropagation();
    }

    // A second finger touching down on another node while a first finger is
    // already holding one (pending or actively dragging) adds it to the
    // selection instead of starting its own drag — the touch equivalent of
    // shift-click.
    if (
      e.pointerType === "touch" &&
      this.host.drag.hasOtherActiveTouchPointer(e.pointerId)
    ) {
      this.toggleInSelection(nodeId);
      navigator.vibrate?.(10);
      return;
    }

    this.handleNodeSelect(e, nodeId);

    if (this.host.layoutMode === "freeform") {
      this.host.drag.beginPendingFreeformDrag(e, nodeId);
    } else {
      this.host.drag.beginPendingOrderedDrag(e, nodeId);
    }
  }
}