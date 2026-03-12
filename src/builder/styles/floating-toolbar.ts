import { css } from "lit";

export const floatingToolbarStyles = css`
  /* ===== Floating toolbar ===== */

  .floating-toolbar-wrap {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 30;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 13px;
    transition: opacity 120ms ease;
  }

  .floating-toolbar-wrap.toolbar-hidden {
    opacity: 0;
    pointer-events: none;
  }

  /*
   * Row 1: pill extends LEFT from the toggle.
   * Fixed height = toggle height so the layout dropdown (row 2) never shifts.
   */
  .toolbar-top-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    height: 36px;
  }

  /* + / × toggle — always rightmost, never moves */
  .toolbar-toggle {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    background: #2196f3;
    border: none;
    color: #fff;
    font-size: 22px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(33, 150, 243, 0.45);
    transition:
      transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1),
      background 140ms ease;
    user-select: none;
    flex-shrink: 0;
  }

  .toolbar-toggle:hover {
    background: #1976d2;
  }
  .toolbar-toggle.open {
    transform: rotate(45deg);
    background: #1976d2;
  }

  /* Pill — same height as toggle; slides out from behind the + button */
  .toolbar-pill {
    display: flex;
    align-items: center;
    gap: 1px;
    height: 45px;
    box-sizing: border-box;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 999px;
    padding: 3px 6px;
    transform-origin: right center;
    animation: pillIn 180ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  @keyframes pillIn {
    from {
      opacity: 0;
      clip-path: inset(0 0 0 100%);
      transform: translateX(8px);
    }
    to {
      opacity: 1;
      clip-path: inset(0 0 0 0%);
      transform: translateX(0);
    }
  }

  .toolbar-icon-btn {
    width: 40px;
    height: 38px;
    border-radius: 999px;
    border: none;
    background: transparent;
    color: #1a1a2e;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    transition:
      background 120ms ease,
      color 120ms ease;
    user-select: none;
  }

  .toolbar-icon-btn:hover {
    background: #f0f7ff;
    color: #1976d2;
  }
  .toolbar-icon-btn.search-btn {
    color: #2196f3;
  }
  .toolbar-icon-btn.search-btn:hover {
    background: #e3f2fd;
    color: #2196f3;
  }

  .toolbar-icon-btn  {
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
  }

  .tb-glyph {
    font-size: 26px;
    line-height: 1;
    font-weight: 700;
  }

    .tb-glyph-icon {
    font-size: 20px;
    line-height: 1;
    font-weight: 700;
  }

  .toolbar-icon-btn .tb-label {
    font-size: 7.5px;
    font-weight: 500;
    opacity: 0.65;
    line-height: 1;
  }

  .toolbar-divider {
    width: 1px;
    height: 18px;
    background: rgba(0, 0, 0, 0.1);
    margin: 0 3px;
    flex-shrink: 0;
  }

  /* ===== Layout dropdown (row 2) — right-aligned under the toggle ===== */

  .layout-dropdown-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .layout-dropdown-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px 5px 13px;
    background: #2196f3;
    color: #fff;
    border: none;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(33, 150, 243, 0.35);
    transition: background 140ms ease;
    user-select: none;
    white-space: nowrap;
  }

  .layout-dropdown-btn:hover {
    background: #1976d2;
  }

  .layout-dropdown-btn .dd-arrow {
    font-size: 9px;
    transition: transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
    display: inline-block;
    opacity: 0.85;
  }
  .layout-dropdown-btn .dd-arrow.up {
    transform: rotate(180deg);
  }

  .layout-dropdown-list {
    position: absolute;
    top: calc(100% + 5px);
    right: 0;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 14px;
    padding: 4px;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14);
    min-width: 115px;
    animation: dropdownIn 140ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
    z-index: 40;
  }

  @keyframes dropdownIn {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .layout-dropdown-item {
    display: block;
    width: 100%;
    padding: 7px 14px;
    background: transparent;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    text-align: left;
    transition:
      background 100ms ease,
      color 100ms ease;
  }

  .layout-dropdown-item:hover {
    background: #f0f7ff;
    color: #1976d2;
  }
  .layout-dropdown-item.active {
    background: #e3f2fd;
    color: #1565c0;
    font-weight: 600;
  }
`;
