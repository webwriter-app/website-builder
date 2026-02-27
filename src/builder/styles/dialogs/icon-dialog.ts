import { css } from "lit";

export const iconDialogStyles = css`
  /* ================================
     ICON DIALOG ONLY
     Everything scoped to #ww-icon-dialog
     ================================ */

  #ww-icon-dialog::part(panel) {
    width: min(840px, 96vw);
    max-height: 92vh;
  }

  #ww-icon-dialog::part(body) {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow: hidden;
    padding: 0.75rem;
    box-sizing: border-box;
  }

  /* Dialog layout */

  #ww-icon-dialog .dlg {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    min-height: 0;
  }

  #ww-icon-dialog .topbar {
    display: grid;
    grid-template-columns: 1fr 220px;
    gap: 0.75rem;
    align-items: end;
  }

  @media (max-width: 560px) {
    #ww-icon-dialog .topbar {
      grid-template-columns: 1fr;
    }
  }

  #ww-icon-dialog .previewBox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    border-radius: 10px;
    border: 1px solid var(--sl-color-neutral-200);
    background: var(--sl-color-neutral-0);
  }

  #ww-icon-dialog .previewText {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.85rem;
    color: var(--sl-color-neutral-700);
  }

  /* Virtualized grid */

  #ww-icon-dialog .scroller {
    flex: 1;
    min-height: 0;
    overflow: auto;
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: 14px;
    background: var(--sl-color-neutral-0);
    position: relative;
    padding: 10px;
  }

  #ww-icon-dialog .spacer {
    height: var(--spacer-h);
  }

  #ww-icon-dialog .grid {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    gap: 6px;
    align-content: start;
  }

  #ww-icon-dialog .icon-tile {
    height: 60px;
    border-radius: 12px;
    border: 1px solid transparent;
    background: transparent;
    display: grid;
    place-items: center;
    cursor: pointer;
    user-select: none;
    position: relative;
    color: var(--sl-color-neutral-700);
  }

  #ww-icon-dialog .icon-tile:hover {
    background: var(--sl-color-neutral-50);
    border-color: var(--sl-color-neutral-200);
  }

  #ww-icon-dialog .icon-tile[data-selected="true"] {
    background: var(--sl-color-primary-50);
    border-color: var(--sl-color-primary-400);
  }

  #ww-icon-dialog .icon-tile sl-icon {
    font-size: 22px;
    pointer-events: none;
    color: currentColor;
  }

  #ww-icon-dialog .icon-tile .fallback {
    position: absolute;
    font-size: 10px;
    color: var(--sl-color-neutral-500);
    bottom: 6px;
    right: 8px;
    pointer-events: none;
    user-select: none;
  }

  #ww-icon-dialog .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    flex: 0 0 auto;
    padding-top: 0.25rem;
  }

  #ww-icon-dialog .hint {
    font-size: 0.85rem;
    color: var(--sl-color-neutral-600);
  }
`;