import { css } from "lit";

export const settingsStyles = css`
  /* ===== Settings (sidebar + drawers) ===== */

  .settings {
    color: var(--sl-color-gray-600);
    font-size: var(--sl-font-size-medium);
    line-height: var(--sl-line-height-medium);
    font-weight: 400;
    margin: 0;
    padding: 0;
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

  /* Palette "all components" button */
  .all-components-btn::part(base) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: 0.5rem;
    border-radius: 10px;
    aspect-ratio: 1;
  }

  .all-components-btn sl-icon {
    font-size: 1.1rem;
  }
`;