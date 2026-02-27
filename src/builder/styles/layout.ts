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
`;