import type { WebwriterWebsiteBuilder } from "../../widgets/webwriter-website-builder";
import { moveNodeInOrder } from "../../model/layout";

/**
 * Handles the keys that are held down while the focus is inside the widget:
 * - G: show the grid overlay
 * - T: hide the toolbar
 * - A: allow interaction with elements
 * - Shift: enable grid snapping during drag
 *
 * The keys that run once (Escape, Delete, arrows) are actions of the widget with a shortcut.
 */
export class KeyboardController {
  private host: WebwriterWebsiteBuilder;

  constructor(host: WebwriterWebsiteBuilder) {
    this.host = host;
  }

  /** Moves the selected node by one pixel in freeform layout. */
  nudge(dx: number, dy: number) {
    if (this.host.layoutMode !== "freeform") return false;
    const node = this.host.getSelectedNode();
    if (!node) return false;
    const { x, y } = node.pos ?? { x: 0, y: 0 };
    this.host.updateNode(node.id, { pos: { x: x + dx, y: y + dy } });
  }

  /** Moves the selected node one place earlier or later in flow, flex and grid layout. */
  move(delta: number) {
    const { selectedNodeId, layoutMode, activeNodes } = this.host;
    const next = selectedNodeId && layoutMode !== "freeform"
      ? moveNodeInOrder(activeNodes, selectedNodeId, delta)
      : null;
    if (!next) return false;
    this.host.setActiveNodes(next);
  }

  onKeyDown = (e: KeyboardEvent) => {
    if (this.host.isEditingWithinComponent()) return;

    switch (e.key) {
      case "g":
      case "G":
        this.host.gridKeyPressed = true;
        return;

      case "t":
      case "T":
        this.host.toolbarKeyHidden = true;
        return;

      case "a":
      case "A":
        this.host.interactKeyPressed = true;
        this.host.requestUpdate();
        return;

      case "Shift":
        this.host.shiftPressed = true;
        return;
    }
  };

  onKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Shift":
        this.host.shiftPressed = false;
        break;
      case "g":
      case "G":
        this.host.gridKeyPressed = false;
        break;
      case "t":
      case "T":
        this.host.toolbarKeyHidden = false;
        break;
      case "a":
      case "A":
        this.host.interactKeyPressed = false;
        this.host.requestUpdate();
        break;
    }
  };

  /** A key released outside the widget never reaches onKeyUp: forget the held keys. */
  onFocusOut = (e: FocusEvent) => {
    if (e.relatedTarget instanceof Node && this.host.contains(e.relatedTarget)) return;
    this.onWindowBlur();
  };

  onWindowBlur = () => {
    this.host.shiftPressed = false;
    this.host.gridKeyPressed = false;
    this.host.toolbarKeyHidden = false;
    if (this.host.interactKeyPressed) {
      this.host.interactKeyPressed = false;
      this.host.requestUpdate();
    }
  };
}
