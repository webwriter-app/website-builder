import { css } from "lit";

export const hostStyles = css`
  :host {
    display: block;
    box-sizing: border-box;
    container-type: inline-size;
    width: 100%;
    min-width: 300px;
    max-width: 2100px;
    height: 850px;
    min-height: 480px;
    overflow: hidden;
    background: var(--sl-color-neutral-0);
    padding: 0;
    margin: 0;
    position: relative;
    color: var(--ww-text-color, inherit);
    font-family: var(--ww-font-family, 'Geist', 'Geist Sans', ui-sans-serif, system-ui, sans-serif);
    border: 1px solid lightgray;
  }

  /* Make the widget fill the screen in fullscreen */
  :host(:fullscreen) {
    width: 100vw;
    max-width: none;
    height: 100vh;
    background: var(--sl-color-neutral-0);
  }
`;
