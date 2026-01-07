import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const VideoComponent: BuilderComponent = {
  type: "video",
  label: "Video",
  group: "media",

  render: () => html`
    <style>
      .resizable {
        display: inline-block;
        resize: both;
        overflow: hidden;
        border: 1px solid #ccc;
        min-width: 100px;
        min-height: 75px;
        width: auto;
        height: auto;
      }

      .resizable video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
    </style>

    <div class="resizable">
      <video
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        controls
      ></video>
    </div>
  `,
};
