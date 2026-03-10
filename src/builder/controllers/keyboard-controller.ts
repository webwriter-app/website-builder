import type { WebwriterWebsiteBuilder } from "../../webwriter-website-builder";

/**
 * Handles all keyboard shortcuts:
 * - Escape: exit drill / clear selection
 * - Delete/Backspace: delete selected node
 * - Arrow keys: nudge node in freeform
 * - G: toggle grid overlay
 * - T: hide toolbar temporarily
 * - A: allow interaction with elements
 * - Shift: enable grid snapping during drag
 */
export class KeyboardController {
  private host: WebwriterWebsiteBuilder;

  constructor(host: WebwriterWebsiteBuilder) {
    this.host = host;
  }

  onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        if (this.host.focusedContainerId) {
          this.host.focusedContainerId = null;
          this.host.requestUpdate();
        } else {
          this.host.clearSelection();
        }
        return;

      case "g":
      case "G":
        if (!this.host.gridKeyPressed) {
          this.host.gridKeyPressed = true;
          this.host.requestUpdate();
        }
        return;

      case "t":
      case "T":
        if (!this.host.toolbarKeyHidden) {
          this.host.toolbarKeyHidden = true;
          this.host.requestUpdate();
        }
        return;

      case "a":
      case "A":
        this.host.interactKeyPressed = true;
        return;

      case "Shift":
        this.host.shiftPressed = true;
        return;

      case "Backspace":
      case "Delete":
        if (this.host.isEditingWithinComponent()) return;
        if (this.host.isStudentMode() && !this.host.allowDeleteInStudent) return;
        e.preventDefault();
        this.host.deleteSelectedNode();
        return;
    }

    // Arrow nudge (freeform only)
    if (this.host.layoutMode !== "freeform") return;
    const node = this.host.getSelectedNode();
    if (!node) return;

    const pos = node.pos ?? { x: 0, y: 0 };
    let { x, y } = pos;

    switch (e.key) {
      case "ArrowUp":    e.preventDefault(); y -= 1; break;
      case "ArrowDown":  e.preventDefault(); y += 1; break;
      case "ArrowLeft":  e.preventDefault(); x -= 1; break;
      case "ArrowRight": e.preventDefault(); x += 1; break;
      default: return;
    }

    this.host.updateNode(node.id, { pos: { x, y } });
  };

  onKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "Shift":
        this.host.shiftPressed = false;
        break;
      case "g":
      case "G":
        this.host.gridKeyPressed = false;
        this.host.requestUpdate();
        break;
      case "t":
      case "T":
        this.host.toolbarKeyHidden = false;
        this.host.requestUpdate();
        break;
      case "a":
      case "A":
        this.host.interactKeyPressed = false;
        break;
    }
  };
}