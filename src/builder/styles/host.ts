import { css } from "lit";

export const hostStyles = css`
  :host {
    display: flex;
    width: 100%;
    height: 850px;
    overflow: hidden;
    background: var(--sl-color-neutral-0);
    padding: 0;
    margin: 0;
    position: relative;
    font-family: 'Geist', 'Geist Sans', ui-sans-serif, system-ui, sans-serif;
    border: 1px solid lightgray;
  }

  /* Make the widget fill the screen in fullscreen */
  :host(:fullscreen) {
    width: 100vw;
    height: 100vh;
    background: var(--sl-color-neutral-0);
  }
`;