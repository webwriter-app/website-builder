import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";
import { audioLogic } from "./AudioLogicDirective";

import "@shoelace-style/shoelace/dist/components/icon-button/icon-button.js";
import "@shoelace-style/shoelace/dist/components/range/range.js";

export const AudioComponent: BuilderComponent = {
  type: "audio",
  label: "Audio",
  group: "media",

  render: () => html`
    <style>
      .audio-player {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem;
        border: 1px solid #ccc;
        border-radius: 6px;
        width: 280px;
        background: white;
        user-select: none;
        pointer-events: auto;
      }

      .controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .time-display {
        font-size: 0.8rem;
        width: 70px;
        text-align: right;
        pointer-events: none; /* prevent accidental editing */
      }

      canvas {
        width: 100%;
        height: 50px;
        background: #f3f3f3;
        border-radius: 4px;
        pointer-events: none;
      }

      audio {
        display: none;
      }

      sl-range {
        flex: 1;
      }

      .volume-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .volume-row span {
        pointer-events: none; /* prevent accidental editing */
      }
    </style>

    <div class="audio-player" ${audioLogic()}>
      <canvas id="waveform"></canvas>

      <audio
        id="audioEl"
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"
      ></audio>

      <div class="controls">
        <sl-icon-button id="playBtn" name="play"></sl-icon-button>
        <sl-range id="seek" min="0" max="100" value="0"></sl-range>
        <div id="timeDisplay" class="time-display">0:00 / 0:00</div>
      </div>

      <div class="volume-row">
        <span>Volume</span>
        <sl-range id="volume" min="0" max="1" step="0.01" value="1"></sl-range>
      </div>
    </div>
  `,
};
