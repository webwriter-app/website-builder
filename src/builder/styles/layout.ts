import { css } from "lit";

export const layoutStyles = css`
  .editor {
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    min-width: 0;
  }

  .layout {
    display: flex;
    flex: 1;
    height: 100%;
    min-width: 0;
  }

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
    overflow: visible;
    position: relative;
    min-width: 0;
    border: 2px dashed var(--sl-color-neutral-300);
    box-sizing: border-box;
    transition: border-color 200ms ease;
  }

  .canvas.has-nodes {
    border-color: transparent;
  }

  :host(:fullscreen) .canvas {
    overflow: hidden;
    background: var(--sl-color-neutral-0);
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: 12px;
  }

  :host(:fullscreen) .canvas.has-nodes {
    border-color: var(--sl-color-neutral-200);
  }

  .drop-zone {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: #9ca3af;
    letter-spacing: 0.01em;
    pointer-events: none;
    user-select: none;
  }

  .builder-element {
    user-select: none;
  }

  .builder-element.selected {
    outline: 2px solid var(--sl-color-primary-600);
    outline-offset: 2px;
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
    display: flex;
  }

  .grid-root {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    display: grid;
  }

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

  /* ── Nested containers ─────────────────────────────────────────────── */

  .nested-container {
    width: 100%;
    min-height: 48px;
  }

  .container-empty-hint {
    padding: 8px 12px;
    font-size: 0.75rem;
    color: var(--sl-color-neutral-400);
    border: 1px dashed var(--sl-color-neutral-300);
    border-radius: 6px;
    text-align: center;
  }

  /* Container: no outline by default; solid ring only when selected */
  .builder-element.is-container > .drag-shell {
    border-radius: 6px;
  }

  .builder-element.is-container.selected > .drag-shell {
    outline: 2px solid var(--sl-color-primary-600);
    outline-offset: 3px;
  }

  /* ── Nested items ──────────────────────────────────────────────────── */

  .nested-item {
    cursor: pointer;
  }

  .nested-item.drillable:hover:not(.selected) {
    outline: 1px dashed var(--sl-color-primary-300);
    outline-offset: 1px;
    border-radius: 3px;
  }

  /* ── Group toolbar ─────────────────────────────────────────────────── */

  .group-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: var(--sl-color-primary-50);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    margin-top: 6px;
    margin-bottom: 0;
    height: 32px;
  }

  .group-count {
    font-size: 0.78rem;
    font-weight: 600;
    color: #2196f3;
    white-space: nowrap;
  }

  .group-template-select {
    font-size: 0.78rem;
    border-radius: 6px;
    border: 1px solid var(--sl-color-neutral-300);
    padding: 2px 4px;
    background: white;
    flex: 1;
    min-width: 0;
    font-family: "Geist", "Geist Sans", ui-sans-serif, system-ui, sans-serif;
    font-weight: 600;
  }

  .group-btn {
    font-size: 0.78rem;
    padding: 2px 8px;
    border-radius: 6px;
    border: 1px solid var(--sl-color-primary-400);
    background: #2196f3;
    color: white;
    cursor: pointer;
    white-space: nowrap;
  }

  .group-btn--cancel {
    background: transparent;
    color: var(--sl-color-neutral-600);
    border-color: var(--sl-color-neutral-300);
  }

  /* Overriding Shoelace internals to shrink the select */
  .group-template-select::part(combobox) {
    height: 24px;
    width: 130px;
    min-height: unset;
    padding-top: 0;
    padding-bottom: 0;
  }

  .group-template-select::part(display-input) {
  font-family: "Geist", "Geist Sans", ui-sans-serif, system-ui, sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
}

  /* ── Layers panel ──────────────────────────────────────────────────── */

  .layer-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.82rem;
  }

  .layer-row:hover {
    background: var(--sl-color-neutral-50);
  }

  .layer-row--selected {
    background: var(--sl-color-primary-50);
  }

  .layer-glyph {
    font-size: 0.8rem;
    width: 18px;
    text-align: center;
  }

  .layer-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .layer-z-controls {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .layer-z-btn {
    font-size: 0.65rem;
    background: none;
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: 4px;
    padding: 0 3px;
    cursor: pointer;
    line-height: 1.4;
  }

  .layer-z-val {
    font-size: 0.72rem;
    min-width: 16px;
    text-align: center;
  }
`;
