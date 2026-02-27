import { css } from "lit";

export const paletteStyles = css`
  /* ===== Palette header ===== */

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

  .palette-search sl-input::part(base) {
    border-radius: 999px;
    background: var(--sl-color-neutral-0);
  }

  /* ===== Segment buttons ===== */

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

  /* ===== Quick row ===== */

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

  /* ===== Tray ===== */

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

  /* ===== Palette tiles (drag tiles) ===== */

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
`;