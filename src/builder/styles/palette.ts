import { css } from "lit";

// The old search bar + quick-row + tray palette has been replaced by the floating toolbar.
// We keep only the .tile-icon style used in the all-components dialog cards.
export const paletteStyles = css`
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
    flex-shrink: 0;
  }
`;