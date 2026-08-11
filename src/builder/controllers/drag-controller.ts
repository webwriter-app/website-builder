import type { WebwriterWebsiteBuilder } from "../../webwriter-website-builder";
import { sortedNodes, normalizeOrder } from "../layout";
import { ComponentRegistry } from "../../components/registry";
import type { BuilderNode } from "../types";

/**
 * Handles all drag-and-drop logic:
 * - Freeform pending/commit drag
 * - Ordered sort drag (flow/flex/grid)
 * - HTML5 drag-start / drag-over / drop
 */
export class DragController {
  private host: WebwriterWebsiteBuilder;

  private readonly DRAG_THRESHOLD = 6;
  private readonly TOUCH_TOLERANCE = 12;
  private readonly TOUCH_HOLD_MS = 300;

  // Freeform pending drag
  private _pendingFreeformDrag: {
    pointerId: number;
    nodeId: string;
    startX: number;
    startY: number;
    onMove: (e: PointerEvent) => void;
    onUp: (e: PointerEvent) => void;
    holdTimer?: number;
    releaseContextMenu?: () => void;
  } | null = null;

  // Ordered pending drag
  private _pendingOrderedDrag: {
    pointerId: number;
    nodeId: string;
    startX: number;
    startY: number;
    event: PointerEvent;
    holdTimer?: number;
    releaseContextMenu?: () => void;
  } | null = null;

  // Ordered sort state
  private _sortDragging = false;
  private _sortDragId: string | null = null;
  private _sortPointerId: number | null = null;
  private _sortStartIndex = -1;
  private _sortCurrentIndex = -1;
  private _sortReleaseGesture?: () => void;

  private _dragEl: HTMLElement | null = null;
  private _placeholderEl: HTMLElement | null = null;
  private _dragOffsetX = 0;
  private _dragOffsetY = 0;
  private _rafMovePending = false;
  private _lastPointerX = 0;
  private _lastPointerY = 0;
  private _orderedMoveHandler?: (e: PointerEvent) => void;
  private _orderedUpHandler?: (e: PointerEvent) => void;
  private _pendingOrderedMoveHandler?: (e: PointerEvent) => void;
  private _pendingOrderedUpHandler?: (e: PointerEvent) => void;

  private _activeTouchPointers = new Set<number>();

  constructor(host: WebwriterWebsiteBuilder) {
    this.host = host;
  }

  /** Whether some touch pointer other than `pointerId` is currently holding a node down. */
  hasOtherActiveTouchPointer(pointerId: number): boolean {
    for (const id of this._activeTouchPointers) {
      if (id !== pointerId) return true;
    }
    return false;
  }

  // ─── HTML5 Drag ───────────────────────────────────────────────────────────

  onDragStart(event: DragEvent) {
    const target = event.target as HTMLElement;
    const type = target.getAttribute("data-component-type");
    event.dataTransfer?.setData("component-type", type ?? "");
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const type = event.dataTransfer?.getData("component-type");
    if (!type) return;
    if (!ComponentRegistry[type]) return;

    if (this.host.layoutMode === "freeform") {
      this._dropFreeform(event, type);
    } else {
      this._dropFlowLike(event, type);
    }
  }

  private _dropFreeform(event: DragEvent, type: string) {
    const canvasEl = this.host.renderRoot.querySelector(
      ".canvas",
    ) as HTMLElement | null;
    if (!canvasEl) return;

    const rect = canvasEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const node: BuilderNode = {
      id: crypto.randomUUID(),
      type,
      data: structuredClone(ComponentRegistry[type]?.defaultData ?? {}),
      pos: { x, y },
      order: this.host.activeNodes.length,
      display: "block",
    };

    this.host.setActiveNodes([...this.host.activeNodes, node]);
    this.host.selectNodeId(node.id);
  }

  private _dropFlowLike(event: DragEvent, type: string) {
    const { layoutMode } = this.host;
    const root = this.host.renderRoot.querySelector(
      layoutMode === "flow"
        ? ".flow-root"
        : layoutMode === "flex"
          ? ".flex-root"
          : ".grid-root",
    ) as HTMLElement | null;

    if (layoutMode === "grid" && root) {
      const placement = this.host.gridPlacementFromPointer(
        root,
        event.clientX,
        event.clientY,
      );
      const node: BuilderNode = {
        id: crypto.randomUUID(),
        type,
        data: structuredClone(ComponentRegistry[type]?.defaultData ?? {}),
        order: this.host.activeNodes.length,
        display: "block",
        grid: placement,
      };
      this.host.setActiveNodes([...this.host.activeNodes, node]);
      this.host.normalizeOrder();
      this.host.selectNodeId(node.id);
      return;
    }

    const items = root
      ? (Array.from(root.querySelectorAll(".flow-item")) as HTMLElement[])
      : [];

    const y = event.clientY;
    let insertIndex = items.length;
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        insertIndex = i;
        break;
      }
    }

    const node: BuilderNode = {
      id: crypto.randomUUID(),
      type,
      data: structuredClone(ComponentRegistry[type]?.defaultData ?? {}),
      order: insertIndex,
      display: "block",
    };

    const sorted = sortedNodes(this.host.activeNodes);
    sorted.splice(insertIndex, 0, node);
    this.host.setActiveNodes(sorted);
    this.host.normalizeOrder();
    this.host.selectNodeId(node.id);
  }

  // ─── Freeform Drag ───────────────────────────────────────────────────────

  /**
   * A press on a freeform node that may still turn into a drag.
   *
   * Mouse and pen start dragging as soon as the pointer travels past a small
   * threshold. A finger cannot do that: the same movement is how the reader
   * scrolls the page, so a touch has to rest on the node for {@link TOUCH_HOLD_MS}
   * before it picks it up. Moving before that leaves the gesture to the browser.
   */
  beginPendingFreeformDrag(e: PointerEvent, nodeId: string) {
    this.cancelPendingFreeformDrag();

    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    const isTouch = e.pointerType === "touch";

    const el = this.host.renderRoot.querySelector(
      `[data-node-id="${nodeId}"]`,
    ) as HTMLElement | null;
    const canvas = this.host.renderRoot.querySelector(
      ".canvas",
    ) as HTMLElement | null;
    if (!el || !canvas) return;

    try {
      el.setPointerCapture(pointerId);
    } catch {}

    if (isTouch) this._activeTouchPointers.add(pointerId);

    let lastX = startX;
    let lastY = startY;

    const start = (x: number, y: number) => {
      this.cancelPendingFreeformDrag();
      this.commitFreeformDrag(pointerId, nodeId, el, canvas, x, y, isTouch);
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      lastX = ev.clientX;
      lastY = ev.clientY;

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (isTouch) {
        // The finger travelled before the hold elapsed: this is a scroll.
        if (distance >= this.TOUCH_TOLERANCE) {
          this.cancelPendingFreeformDrag();
          this._activeTouchPointers.delete(pointerId);
        }
        return;
      }

      if (distance >= this.DRAG_THRESHOLD) start(ev.clientX, ev.clientY);
    };

    const onUp = () => {
      this.cancelPendingFreeformDrag();
      this._activeTouchPointers.delete(pointerId);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onUp, { once: true });

    this._pendingFreeformDrag = {
      pointerId,
      nodeId,
      startX,
      startY,
      onMove,
      onUp,
      holdTimer: isTouch
        ? window.setTimeout(() => start(lastX, lastY), this.TOUCH_HOLD_MS)
        : undefined,
      releaseContextMenu: isTouch ? this._suppressContextMenu() : undefined,
    };
  }

  cancelPendingFreeformDrag() {
    const pending = this._pendingFreeformDrag;
    if (!pending) return;
    if (pending.holdTimer !== undefined) clearTimeout(pending.holdTimer);
    pending.releaseContextMenu?.();
    window.removeEventListener("pointermove", pending.onMove);
    window.removeEventListener("pointerup", pending.onUp);
    window.removeEventListener("pointercancel", pending.onUp);
    this._pendingFreeformDrag = null;
  }

  commitFreeformDrag(
    pointerId: number,
    nodeId: string,
    el: HTMLElement,
    canvas: HTMLElement,
    initialClientX: number,
    initialClientY: number,
    isTouch = false,
  ) {
    try {
      el.setPointerCapture(pointerId);
    } catch {}

    const rect = el.getBoundingClientRect();
    const offsetX = initialClientX - rect.left;
    const offsetY = initialClientY - rect.top;

    el.classList.add("freeform-dragging");
    const releaseGesture = isTouch ? this._claimTouchGesture() : null;
    if (isTouch) navigator.vibrate?.(10);

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;

      const containerRect = canvas.getBoundingClientRect();
      let newX = ev.clientX - containerRect.left - offsetX;
      let newY = ev.clientY - containerRect.top - offsetY;

      if (this.host.shiftPressed) {
        newX = Math.round(newX / this.host.gridSize) * this.host.gridSize;
        newY = Math.round(newY / this.host.gridSize) * this.host.gridSize;
      }

      newX = Math.max(0, Math.min(newX, containerRect.width - el.offsetWidth));
      newY = Math.max(0, Math.min(newY, containerRect.height - el.offsetHeight));

      this.host.setActiveNodes(
        this.host.activeNodes.map((n) =>
          n.id === nodeId ? { ...n, pos: { x: newX, y: newY } } : n,
        ),
      );
      this.host.requestUpdate();
    };

    const onUp = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      releaseGesture?.();
      el.classList.remove("freeform-dragging");
      this._activeTouchPointers.delete(pointerId);
      try {
        el.releasePointerCapture(pointerId);
      } catch {}
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  /**
   * Claims the running touch gesture so the browser neither pans the page
   * underneath the dragged node nor opens its long-press menu on top of it.
   * `touch-action` cannot do the former: it is latched when the finger goes
   * down, long before the hold turns the press into a drag, so the only way to
   * keep the pointer stream alive is to cancel the browser's own reactions.
   *
   * @returns a function that releases the gesture back to the browser.
   */
  private _claimTouchGesture(): () => void {
    const blockScroll = (ev: TouchEvent) => {
      if (ev.cancelable) ev.preventDefault();
    };
    window.addEventListener("touchmove", blockScroll, { passive: false });
    const releaseContextMenu = this._suppressContextMenu();
    return () => {
      window.removeEventListener("touchmove", blockScroll);
      releaseContextMenu();
    };
  }

  /**
   * Swallows the browser's long-press context menu. It is not enough to let it
   * open and ignore it: Chrome cancels the active pointer when the menu appears,
   * which would drop the node mid-drag.
   *
   * Scoped to the widget — a press anywhere else keeps its normal menu.
   *
   * @returns a function that restores the menu.
   */
  private _suppressContextMenu(): () => void {
    const block = (ev: Event) => ev.preventDefault();
    this.host.addEventListener("contextmenu", block);
    return () => this.host.removeEventListener("contextmenu", block);
  }

  // ─── Ordered Sort Drag ───────────────────────────────────────────────────

  beginPendingOrderedDrag(e: PointerEvent, nodeId: string) {
    this.cancelPendingOrderedDrag();

    const startX = e.clientX;
    const startY = e.clientY;
    const pointerId = e.pointerId;
    const isTouch = e.pointerType === "touch";

    const el = this.host.renderRoot.querySelector(
      `[data-node-id="${nodeId}"]`,
    ) as HTMLElement | null;
    if (el) {
      try {
        el.setPointerCapture(pointerId);
      } catch {}
    }

    if (isTouch) this._activeTouchPointers.add(pointerId);

    let lastX = startX;
    let lastY = startY;

    const start = (x: number, y: number) => {
      this.cancelPendingOrderedDrag();
      this.startOrderedSortDrag(
        { ...e, clientX: x, clientY: y } as PointerEvent,
        nodeId,
        isTouch,
      );
    };

    const onMove = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      lastX = ev.clientX;
      lastY = ev.clientY;

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (isTouch) {
        // The finger travelled before the hold elapsed: this is a scroll.
        if (distance >= this.TOUCH_TOLERANCE) {
          this.cancelPendingOrderedDrag();
          this._activeTouchPointers.delete(pointerId);
        }
        return;
      }

      if (distance >= this.DRAG_THRESHOLD) start(ev.clientX, ev.clientY);
    };

    const onUp = () => {
      this.cancelPendingOrderedDrag();
      this._activeTouchPointers.delete(pointerId);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onUp, { once: true });

    this._pendingOrderedDrag = {
      pointerId,
      nodeId,
      startX,
      startY,
      event: e,
      holdTimer: isTouch
        ? window.setTimeout(() => start(lastX, lastY), this.TOUCH_HOLD_MS)
        : undefined,
      releaseContextMenu: isTouch ? this._suppressContextMenu() : undefined,
    };
    this._pendingOrderedMoveHandler = onMove;
    this._pendingOrderedUpHandler = onUp;
  }

  cancelPendingOrderedDrag() {
    const pending = this._pendingOrderedDrag;
    if (!pending) return;
    if (pending.holdTimer !== undefined) clearTimeout(pending.holdTimer);
    pending.releaseContextMenu?.();
    if (this._pendingOrderedMoveHandler)
      window.removeEventListener("pointermove", this._pendingOrderedMoveHandler);
    if (this._pendingOrderedUpHandler) {
      window.removeEventListener("pointerup", this._pendingOrderedUpHandler);
      window.removeEventListener("pointercancel", this._pendingOrderedUpHandler);
    }
    this._pendingOrderedDrag = null;
    this._pendingOrderedMoveHandler = undefined;
    this._pendingOrderedUpHandler = undefined;
  }

  startOrderedSortDrag(e: PointerEvent, nodeId: string, isTouch = false) {
    if (this.host.layoutMode === "freeform") return;

    const rootSel =
      this.host.layoutMode === "flow"
        ? ".flow-root"
        : this.host.layoutMode === "flex"
          ? ".flex-root"
          : ".grid-root";

    const root = this.host.renderRoot.querySelector(rootSel) as HTMLElement | null;
    if (!root) return;

    const el = this.host.renderRoot.querySelector(
      `[data-node-id="${nodeId}"]`,
    ) as HTMLElement | null;
    if (!el) return;

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}

    const ordered = sortedNodes(this.host.activeNodes);
    const startIndex = ordered.findIndex((n) => n.id === nodeId);
    if (startIndex < 0) return;

    const r = el.getBoundingClientRect();
    const placeholder = document.createElement("div");
    placeholder.className = "drag-placeholder";
    placeholder.style.width = `${r.width}px`;
    placeholder.style.height = `${r.height}px`;
    el.after(placeholder);

    const offsetX = e.clientX - r.left;
    const offsetY = e.clientY - r.top;

    el.classList.add("dragging");
    el.style.position = "fixed";
    el.style.left = `${r.left}px`;
    el.style.top = `${r.top}px`;
    el.style.width = `${r.width}px`;
    el.style.height = `${r.height}px`;
    el.style.margin = "0";
    el.style.transform = "translate3d(0,0,0)";

    this._sortDragging = true;
    this._sortDragId = nodeId;
    this._sortPointerId = e.pointerId;
    this._sortStartIndex = startIndex;
    this._sortCurrentIndex = startIndex;
    this._dragEl = el;
    this._placeholderEl = placeholder;

    if (isTouch) {
      this._sortReleaseGesture = this._claimTouchGesture();
      navigator.vibrate?.(10);
    }
    this._dragOffsetX = offsetX;
    this._dragOffsetY = offsetY;

    const onMove = (ev: PointerEvent) => this._onOrderedSortMove(ev);
    const onUp = (ev: PointerEvent) => this.finishOrderedSortDrag(ev);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    window.addEventListener("pointercancel", onUp, { once: true });
    this._orderedMoveHandler = onMove;
    this._orderedUpHandler = onUp;
  }

  private _onOrderedSortMove(ev: PointerEvent) {
    if (!this._sortDragging || !this._dragEl || !this._placeholderEl) return;

    this._lastPointerX = ev.clientX;
    this._lastPointerY = ev.clientY;

    if (this._rafMovePending) return;
    this._rafMovePending = true;

    requestAnimationFrame(() => {
      this._rafMovePending = false;
      this._orderedSortMoveFrame(this._lastPointerX, this._lastPointerY);
    });
  }

  private _orderedSortMoveFrame(clientX: number, clientY: number) {
    if (!this._sortDragging || !this._dragEl || !this._placeholderEl) return;

    const x = clientX - this._dragOffsetX;
    const y = clientY - this._dragOffsetY;
    this._dragEl.style.left = `${x}px`;
    this._dragEl.style.top = `${y}px`;

    const rootSel =
      this.host.layoutMode === "flow"
        ? ".flow-root"
        : this.host.layoutMode === "flex"
          ? ".flex-root"
          : ".grid-root";

    const root = this.host.renderRoot.querySelector(rootSel) as HTMLElement | null;
    if (!root) return;

    const items = Array.from(root.querySelectorAll(".flow-item")) as HTMLElement[];

    const first = new Map<HTMLElement, DOMRect>();
    for (const it of items) first.set(it, it.getBoundingClientRect());

    const nextIndex = this._computeInsertionIndex(root, clientX, clientY);
    if (nextIndex !== this._sortCurrentIndex) {
      this._sortCurrentIndex = nextIndex;
      const siblings = items.filter((it) => it !== this._dragEl);
      const ref = siblings[nextIndex] ?? null;
      if (ref) root.insertBefore(this._placeholderEl, ref);
      else root.appendChild(this._placeholderEl);
    }

    const last = new Map<HTMLElement, DOMRect>();
    for (const it of items) last.set(it, it.getBoundingClientRect());

    for (const it of items) {
      if (it === this._dragEl) continue;
      const a = first.get(it);
      const b = last.get(it);
      if (!a || !b) continue;
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (dx || dy) {
        it.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        it.getBoundingClientRect();
        it.style.transform = "";
      }
    }
  }

  private _computeInsertionIndex(root: HTMLElement, x: number, y: number): number {
    const items = Array.from(root.querySelectorAll(".flow-item")) as HTMLElement[];
    const candidates = items.filter((el) => el !== this._dragEl);
    if (candidates.length === 0) return 0;

    if (this.host.layoutMode === "flow") {
      for (let i = 0; i < candidates.length; i++) {
        const r = candidates[i].getBoundingClientRect();
        if (y < r.top + r.height / 2) return i;
      }
      return candidates.length;
    }

    if (this.host.layoutMode === "grid") {
      const rootRect = root.getBoundingClientRect();
      const cs = getComputedStyle(root);
      const cols =
        cs.gridTemplateColumns.split(" ").filter((t) => t.trim().length > 0).length || 1;
      const refRect = candidates[0].getBoundingClientRect();
      const cellW = Math.max(1, refRect.width);
      const cellH = Math.max(1, refRect.height);
      const gapX = parseFloat(cs.columnGap || "0") || 0;
      const gapY = parseFloat(cs.rowGap || "0") || 0;
      const relX = x - rootRect.left;
      const relY = y - rootRect.top;
      let col = Math.floor(relX / (cellW + gapX));
      let row = Math.floor(relY / (cellH + gapY));
      col = Math.max(0, Math.min(col, cols - 1));
      row = Math.max(0, row);
      let idx = Math.max(0, Math.min(row * cols + col, candidates.length));
      const over = candidates[Math.min(idx, candidates.length - 1)];
      if (over) {
        const r = over.getBoundingClientRect();
        const after =
          x > r.left + r.width / 2 ||
          (y > r.top + r.height / 2 &&
            Math.abs(y - (r.top + r.height / 2)) >
              Math.abs(x - (r.left + r.width / 2)));
        if (after) idx = Math.min(idx + 1, candidates.length);
      }
      return idx;
    }

    // Flex
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < candidates.length; i++) {
      const r = candidates[i].getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = (x - cx) ** 2 + (y - cy) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    const lastRect = candidates[candidates.length - 1].getBoundingClientRect();
    if (y > lastRect.bottom + 8 || x > lastRect.right + 8) return candidates.length;

    const r = candidates[bestIdx].getBoundingClientRect();
    const after =
      Math.abs(x - (r.left + r.width / 2)) > Math.abs(y - (r.top + r.height / 2))
        ? x > r.left + r.width / 2
        : y > r.top + r.height / 2;

    return after ? bestIdx + 1 : bestIdx;
  }

  finishOrderedSortDrag(ev: PointerEvent) {
    this.cancelPendingOrderedDrag();
    this._activeTouchPointers.delete(this._sortPointerId ?? ev.pointerId);
    if (this._orderedMoveHandler)
      window.removeEventListener("pointermove", this._orderedMoveHandler);
    if (this._orderedUpHandler) {
      window.removeEventListener("pointerup", this._orderedUpHandler);
      window.removeEventListener("pointercancel", this._orderedUpHandler);
      this._orderedUpHandler = undefined;
    }

    if (!this._sortDragging || !this._dragEl || !this._placeholderEl || !this._sortDragId) {
      this._resetOrderedDragArtifacts();
      return;
    }

    const rootSel =
      this.host.layoutMode === "flow"
        ? ".flow-root"
        : this.host.layoutMode === "flex"
          ? ".flex-root"
          : ".grid-root";

    const root = this.host.renderRoot.querySelector(rootSel) as HTMLElement | null;

    let to = this._sortCurrentIndex;
    if (root && this._placeholderEl.parentElement === root) {
      to = 0;
      for (const child of Array.from(root.children)) {
        if (child === this._placeholderEl) break;
        const el = child as HTMLElement;
        if (el.classList.contains("flow-item") && el !== this._dragEl) to++;
      }
    }

    const targetRect = this._placeholderEl.getBoundingClientRect();
    const currentRect = this._dragEl.getBoundingClientRect();
    const dx = targetRect.left - currentRect.left;
    const dy = targetRect.top - currentRect.top;

    this._dragEl
      .querySelector(".drag-shell")
      ?.animate(
        [
          { transform: "translateZ(0) scale(1.03)" },
          { transform: "translateZ(0) scale(1)" },
        ],
        { duration: 140, easing: "cubic-bezier(.2,.8,.2,1)" },
      );

    const sortDragId = this._sortDragId;
    this._dragEl.animate(
      [
        { transform: "translate3d(0,0,0)" },
        { transform: `translate3d(${dx}px,${dy}px,0)` },
      ],
      { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" },
    ).onfinish = () => {
      const ordered = sortedNodes(this.host.activeNodes);
      const from = ordered.findIndex((n) => n.id === sortDragId);
      if (from >= 0) {
        const [moved] = ordered.splice(from, 1);
        ordered.splice(to, 0, moved);
        this.host.setActiveNodes(normalizeOrder(ordered));
      }
      this._resetOrderedDragArtifacts();
      this.host.requestUpdate();
    };

    try {
      this._dragEl.releasePointerCapture(this._sortPointerId ?? ev.pointerId);
    } catch {}
  }

  private _resetOrderedDragArtifacts() {
    this.cancelPendingOrderedDrag();
    this._sortReleaseGesture?.();
    this._sortReleaseGesture = undefined;
    if (this._dragEl) {
      this._dragEl.classList.remove("dragging");
      this._dragEl.style.cssText = "";
    }
    if (this._placeholderEl?.parentElement)
      this._placeholderEl.parentElement.removeChild(this._placeholderEl);

    this._sortDragging = false;
    this._sortDragId = null;
    this._sortPointerId = null;
    this._sortStartIndex = -1;
    this._sortCurrentIndex = -1;
    this._dragEl = null;
    this._placeholderEl = null;
  }
}