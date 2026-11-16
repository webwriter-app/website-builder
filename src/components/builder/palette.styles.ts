import { css } from "lit";

// The .tile-icon style of the cards in the all-components dialog.
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