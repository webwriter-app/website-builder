import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

/**
 * Small default placeholder video (MDN demo, can be replaced later)
 */
const PLACEHOLDER_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const VideoComponent: BuilderComponent = {
  type: "video",
  label: "Video",
  group: "media",

  defaultData: {
    src: PLACEHOLDER_VIDEO,
  },

  render(data) {
    const src = data?.src || PLACEHOLDER_VIDEO;

    return html`
      <style>
        .resizable {
          display: inline-block;
          resize: both;
          overflow: hidden;
          border: 1px solid #ccc;
          min-width: 160px;
          min-height: 120px;
          width: 320px;
          height: 180px;
        }

        .resizable video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          pointer-events: none;
        }
      </style>

      <div class="resizable">
        <video src=${src} controls></video>
      </div>
    `;
  },

  // Generic editable fields (shown in "Content")
  bindings: [
    {
      key: "src",
      label: "Video URL",
      kind: "attr",
      target: "video",
      name: "src",
      placeholder: "https://… or data:video/…",
    },
  ],

  // Upload and reset belong into custom settings
  settings: (element) => {
    const video = element.querySelector("video") as HTMLVideoElement | null;
    if (!video) return html``;

    const onFileChange = (e: Event) => {
      const input = e.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("video/")) return;

      const reader = new FileReader();
      reader.onload = () => {
        video.src = String(reader.result ?? PLACEHOLDER_VIDEO);
      };
      reader.readAsDataURL(file);

      // allow re-uploading the same file
      input.value = "";
    };

    const resetToPlaceholder = () => {
      video.src = PLACEHOLDER_VIDEO;
    };

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">Video</h2>

        <div class="setting-row">
          <label
            style="
              display: block;
              font-size: var(--sl-input-label-font-size-medium);
              color: var(--sl-color-neutral-700);
              margin-bottom: 0.25rem;
            "
          >
            Upload Video
          </label>

          <input
            type="file"
            accept="video/*"
            @change=${onFileChange}
            style="display:block; width:100%; box-sizing:border-box;"
          />
        </div>

        <div class="setting-row">
          <sl-button
            size="small"
            variant="default"
            @click=${resetToPlaceholder}
          >
            Reset to placeholder
          </sl-button>
        </div>
      </div>
    `;
  },
};
