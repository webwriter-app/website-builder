import { css } from "lit";

export const settingsStyles = css`
  /* ===== Settings (sidebar + drawers) ===== */

  .settings {
    color: var(--sl-color-neutral-700);
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

  /* ===== Visibility section ===== */

  .vis-section {
    margin-top: 0.75rem;
  }

  .vis-section + .vis-section {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--sl-color-neutral-100);
  }

  .vis-section-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #4ba3eb;
    margin-bottom: 0.5rem;
  }

  .vis-section-label sl-icon {
    font-size: 0.8rem;
    color: #4ba3eb;
  }

  /* Chip row — wraps naturally, no clipping */
  .vis-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .vis-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.6rem 0.25rem 0.5rem;
    border-radius: 999px;
    border: 1px solid var(--sl-color-neutral-200);
    background: #2196f3;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--sl-color-neutral-500);
    transition:
      background 110ms ease,
      border-color 110ms ease,
      color 110ms ease;
    user-select: none;
    white-space: nowrap;
  }

  .vis-chip:hover {
    background: var(--sl-color-neutral-50);
    border-color: var(--sl-color-neutral-300);
    color: var(--sl-color-neutral-700);
  }

  .vis-chip[data-active="true"] {
    background: #2196f3;
    border-color: var(--sl-color-primary-200);
    color: var(--sl-color-neutral-200);
  }

  .vis-chip[data-active="false"] {
    background: var(--sl-color-neutral-0);
    border-color: var(--sl-color-neutral-200);
    color: var(--sl-color-neutral-400);
  }

  .vis-chip-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
    opacity: 0.6;
  }

  .vis-chip[data-active="true"] .vis-chip-dot {
    opacity: 1;
  }

  /* Switch rows */
  .vis-switch-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.2rem 0;
  }

  .vis-switch-label {
    font-size: 0.8rem;
    color: var(--sl-color-neutral-700);
    line-height: 1.3;
  }

  /* Mode badge */
  .vis-mode-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.6rem;
    padding: 0.18rem 0.5rem;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 500;
    background: var(--sl-color-neutral-100);
    color: var(--sl-color-neutral-500);
    border: 1px solid var(--sl-color-neutral-200);
    width: fit-content;
  }

  .vis-mode-badge sl-icon {
    font-size: 0.7rem;
  }
`;