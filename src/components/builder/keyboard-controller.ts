import type { WebwriterWebsiteBuilder } from "../../widgets/webwriter-website-builder";

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
