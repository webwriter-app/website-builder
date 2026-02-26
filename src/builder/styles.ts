import { css } from "lit";

// NOTE: Keep this file in sync with the original widget styles.
// The goal of the refactor is structural; no UI changes.
export const builderStyles = css`
  :host {
    display: flex;
    width: 100%;
    height: 850px;
    overflow: hidden;
    background: var(--sl-color-neutral-0);
    padding: 0;
    margin: 0;
    position: relative;
  }

  /* Make the widget fill the screen in fullscreen */
  :host(:fullscreen) {
    width: 100vw;
    height: 100vh;
    background: var(--sl-color-neutral-0);
  }

  .editor {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    min-width: 0;
  }

  /* Compact palette */
  .palette {
    background: var(--sl-color-neutral-0);
    border-bottom: 1px solid var(--sl-color-neutral-200);
    padding: 0.5rem 0.75rem 0.55rem 0.75rem;
    position: relative;
    z-index: 5;
  }

  .palette-top {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .palette-search {
    flex: 1;
    min-width: 220px;
  }

  .seg {
    display: inline-flex;
    padding: 0.15rem;
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: 999px;
    background: var(--sl-color-neutral-50);
    gap: 0.15rem;
  }

  .seg-btn {
    border: 0;
    background: transparent;
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    font-size: 0.85rem;
    color: var(--sl-color-neutral-700);
    cursor: pointer;
    user-select: none;
    line-height: 1;
    white-space: nowrap;
    transition:
      background 120ms ease,
      color 120ms ease;
  }

  .seg-btn:hover {
    background: var(--sl-color-neutral-100);
  }

  .seg-btn.active {
    background: var(--sl-color-neutral-0);
    color: var(--sl-color-primary-700);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  .quick-row {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }

  .quick-row::-webkit-scrollbar {
    height: 6px;
  }
  .quick-row::-webkit-scrollbar-thumb {
    background: var(--sl-color-neutral-200);
    border-radius: 999px;
  }

  /* Slide-down tray */
  .tray {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% + 1px);
    background: var(--sl-color-neutral-0);
    border-bottom: 1px solid var(--sl-color-neutral-200);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    border-radius: 0 0 14px 14px;
    overflow: hidden;
    transform-origin: top;
  }

  .tray-inner {
    max-height: 220px;
    overflow: auto;
    padding: 0.65rem;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
    gap: 0.55rem;
  }

  .tray-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0.55rem 0.65rem;
    border-bottom: 1px solid var(--sl-color-neutral-200);
    background: var(--sl-color-neutral-50);
  }

  .tray-title {
    font-size: 0.8rem;
    color: var(--sl-color-neutral-600);
  }

  .tray-count {
    font-size: 0.75rem;
    color: var(--sl-color-neutral-500);
  }

  .tray[hidden] {
    display: none;
  }

  /* Shoelace-specific small polish */
  .palette-search sl-input::part(base) {
    border-radius: 999px;
    background: var(--sl-color-neutral-0);
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    padding: 0.65rem 0.5rem;
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: 12px;
    background: var(--sl-color-neutral-0);
    cursor: grab;
    user-select: none;
    transition:
      transform 120ms ease,
      box-shadow 120ms ease,
      border-color 120ms ease,
      background 120ms ease;
  }

  .tile:hover {
    border-color: var(--sl-color-primary-200);
    background: var(--sl-color-primary-50);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    transform: translateY(-1px);
  }

  .tile:active {
    cursor: grabbing;
    transform: translateY(0px);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  }

  .tile-icon {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    border: 1px solid var(--sl-color-neutral-200);
    background: var(--sl-color-neutral-50);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: var(--sl-color-neutral-700);
  }

  .tile-label {
    font-size: 0.78rem;
    color: var(--sl-color-neutral-800);
    text-align: center;
    line-height: 1.1;
  }

  /* ===== Existing UI ===== */
  .builder-element.selected {
    outline: 2px solid var(--sl-color-primary-600);
    outline-offset: 2px;
  }

  .settings h2 {
    font-size: var(--sl-button-font-size-medium);
    line-height: calc(
      var(--sl-input-height-medium) - var(--sl-input-border-width) * 2
    );
    font-weight: 500;
    margin-top: 0;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 1ch;
    border-bottom: 2px solid var(--sl-color-gray-600);
    color: var(--sl-color-gray-600);
  }

  .settings sl-switch {
    margin-left: 0.1em;
  }

  .setting-row {
    margin-top: 0.75rem;
  }

  .layout {
    display: flex;
    flex: 1;
    height: 100%;
    min-width: 0;
  }

  /* Fullscreen: split canvas + code panel */
  .layout.fullscreen-split {
    display: grid;
    grid-template-columns: minmax(360px, 1fr) minmax(320px, 520px);
    gap: 0.75rem;
    padding: 0.75rem;
    box-sizing: border-box;
  }

  .canvas {
    flex: 1;
    padding: 1rem;
    background: var(--sl-color-neutral-50);
    overflow: hidden;
    position: relative;
    min-width: 0;
    border-radius: 12px;
  }

  :host(:fullscreen) .canvas {
    background: var(--sl-color-neutral-0);
    border: 1px solid var(--sl-color-neutral-200);
  }

  .drop-zone {
    border: 2px dashed var(--sl-color-neutral-300);
    text-align: center;
    color: var(--sl-color-neutral-600);
    border-radius: 0.5rem;
    margin: 1rem;
    height: 95%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .builder-element {
    user-select: none;
  }

  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-size: var(--grid-size, 20px) var(--grid-size, 20px);
    background-image:
      linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  }

  /* NEW: roots for different layout modes */
  .freeform-root {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .flow-root {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 1rem;
    background: var(--sl-color-neutral-0);
    border-radius: 12px;
    border: 1px solid var(--sl-color-neutral-200);
  }

  .flow-item[data-display="inline"] {
    display: inline;
    margin: 0;
  }

  .flow-item[data-display="block"] {
    display: block;
    margin: 0.5rem 0;
  }

  .flex-root {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 1rem;
    background: var(--sl-color-neutral-0);
    border-radius: 12px;
    border: 1px solid var(--sl-color-neutral-200);
    display: flex;
  }

  .grid-root {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 1rem;
    background: var(--sl-color-neutral-0);
    border-radius: 12px;
    border: 1px solid var(--sl-color-neutral-200);
    display: grid;
  }

  /* Hovering fullscreen button (bottom-right of canvas) */
  .fs-btn {
    position: absolute;
    right: 14px;
    bottom: 14px;
    z-index: 20;
    border-radius: 999px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  }
  .fs-btn sl-button::part(base) {
    border-radius: 999px;
  }

  /* Code panel (only shown in fullscreen) */
  .code-panel {
    background: var(--sl-color-neutral-0);
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
  }

  .code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0.6rem;
    border-bottom: 1px solid var(--sl-color-neutral-200);
    background: var(--sl-color-neutral-50);
  }

  .code-title {
    font-size: 0.8rem;
    color: var(--sl-color-neutral-700);
    font-weight: 600;
    white-space: nowrap;
  }

  .code-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 0.6rem;
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    font-size: 12px;
    line-height: 1.4;
    white-space: pre;
    background: var(--sl-color-neutral-0);
    user-select: text;
    margin: 0;
  }

  .code-body code {
    white-space: pre;
  }

  .code-tabs {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    justify-content: flex-end;
  }

  .code-tab {
    border: 1px solid var(--sl-color-neutral-200);
    background: var(--sl-color-neutral-0);
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    font-size: 0.75rem;
    color: var(--sl-color-neutral-700);
    cursor: pointer;
    user-select: none;
  }

  .code-tab.active {
    border-color: var(--sl-color-primary-300);
    background: var(--sl-color-primary-50);
    color: var(--sl-color-primary-700);
  }

  /* dragging visuals */
  .builder-element.dragging {
    z-index: 1000;
    pointer-events: none; /* let pointer hit underlying items for hit-testing */
  }

  .builder-element.dragging .drag-shell {
    transform-origin: center;
    animation: pickUp 140ms ease-out forwards;
  }

  @keyframes pickUp {
    from {
      transform: translateZ(0) scale(1);
      box-shadow: none;
    }
    to {
      transform: translateZ(0) scale(1.03);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
    }
  }

  /* placeholder */
  .drag-placeholder {
    border-radius: 12px;
    outline: 2px dashed rgba(0, 0, 0, 0.18);
    outline-offset: -2px;
    background: rgba(0, 0, 0, 0.03);
  }

  /* FLIP transitions for siblings */
  .flow-root .flow-item,
  .flex-root .flow-item,
  .grid-root .flow-item {
    transition: transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
    will-change: transform;
  }

  .builder-element.dragging {
    will-change: left, top;
  }

  .flow-item {
    contain: layout paint; /* reduces repaint scope */
  }

  .dlg {
    display: grid;
    gap: 0.75rem;
    width: min(820px, 92vw);
  }

  .topbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-end;
    justify-content: space-between;
  }

  .left {
    flex: 1 1 360px;
    min-width: 260px;
    display: grid;
    gap: 0.4rem;
  }

  .meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.8rem;
    color: var(--sl-color-neutral-600);
  }

  .right {
    flex: 0 0 auto;
    display: grid;
    gap: 0.5rem;
    justify-items: end;
  }

  .previewBox {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.5rem 0.6rem;
    border-radius: 12px;
    border: 1px solid var(--sl-color-neutral-200);
    background: var(--sl-color-neutral-0);
    max-width: 320px;
  }

  .previewBox sl-icon {
    font-size: 22px;
  }

  .previewText {
    font-size: 0.85rem;
    color: var(--sl-color-neutral-700);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .scroller {
    height: min(520px, 62vh);
    overflow: auto;
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: 14px;
    background: var(--sl-color-neutral-0);
    position: relative;
  }

  .spacer {
    height: var(--spacer-h, 0px);
  }

  .grid {
    position: absolute;
    inset: 0;
    padding: 0.6rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 0.4rem;
    align-content: start;
    will-change: transform;
  }

  .tile {
    height: 52px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: transparent;
    display: grid;
    place-items: center;
    cursor: pointer;
    user-select: none;
    position: relative;
  }

  .tile:hover {
    background: var(--sl-color-neutral-50);
    border-color: var(--sl-color-neutral-200);
  }

  .tile[data-selected="true"] {
    background: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-400);
  }

  .tile sl-icon {
    font-size: 22px;
    pointer-events: none;
  }

  /* fallback mark when icon fails/empty */
  .tile .fallback {
    position: absolute;
    font-size: 10px;
    color: var(--sl-color-neutral-500);
    bottom: 6px;
    right: 8px;
    pointer-events: none;
    user-select: none;
  }

  /* Icon dialog sizing */
  #ww-icon-dialog::part(panel) {
    width: min(840px, 96vw);
    max-height: 92vh;
  }

  #ww-icon-dialog::part(body) {
    /* let our scroller control the scroll */
    overflow: hidden;
  }

  #ww-icon-dialog .scroller {
    height: min(70vh, 720px);
  }

  #ww-icon-dialog .grid {
    grid-auto-rows: 60px; 
  }
  #ww-icon-dialog .tile {
    height: 60px; 
  }

  .settings {
  color: var(--sl-color-gray-600);
  font-size: var(--sl-font-size-medium);
  line-height: var(--sl-line-height-medium);
  font-weight: 400;
  margin: 0;
  padding: 0;
}

.settings sl-details {
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--sl-color-gray-300);
}

.settings sl-details::part(base) {
  background-color: unset;
  border: none;
}

.settings sl-details::part(summary) {
  font-size: var(--sl-button-font-size-medium);
  font-weight: 500;
  color: var(--sl-color-gray-700);
  padding: 0.4rem 0;
}

.settings sl-details::part(content) {
  padding: 0.5rem 0 0.75rem 0;
}
`;
