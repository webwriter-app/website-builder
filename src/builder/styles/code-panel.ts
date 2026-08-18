import { css } from "lit";

export const codePanelStyles = css`
  /* Code panel */
  .code-panel {
    position: relative;
    background: var(--sl-color-neutral-0);
    border: 1px solid var(--sl-color-neutral-200);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;
  }

  .code-view-controls {
    display: none;
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
    flex: 1;
    min-width: 0;
    gap: 0.35rem;
    align-items: center;
    justify-content: flex-end;
    overflow-x: auto;
    scrollbar-width: thin;
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

  @container (max-width: 420px) {
    .code-title {
      display: none;
    }

    .code-tabs {
      justify-content: flex-start;
    }
  }

  @container (max-width: 700px) {
    .code-view-controls {
      display: flex;
    }
  }
`;
