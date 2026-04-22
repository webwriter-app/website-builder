import { html } from "lit";
import { msg } from "@lit/localize";
import type { BuilderComponent } from "../../types/BuilderComponent";

const PLACEHOLDER_AUDIO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3";

export const AudioComponent: BuilderComponent = {
  type: "audio",
  label: () => msg("Audio"),
  group: "media",

  defaultData: {
    src: PLACEHOLDER_AUDIO,
  },

  render(data) {
    const src = data?.src || PLACEHOLDER_AUDIO;

    return html`
      <style>
        .audio-wrap {
          display: inline-block;
          border: 1px solid #ccc;
          border-radius: 6px;
          padding: 0.5rem;
          background: white;
          width: 320px;
          user-select: none;
        }

        audio {
          width: 100%;
          display: block;
        }
      </style>

      <div class="audio-wrap">
        <audio src=${src} controls></audio>
      </div>
    `;
  },

  // Generic sidebar field
  bindings: () => [
    {
      key: "src",
      label: msg("Audio URL"),
      kind: "attr",
      target: "audio",
      name: "src",
      placeholder: `https://… ${msg("or")} data:audio/…`,
    },
  ],

  // Upload + reset grouped consistently with other media components
  settings: ({ setData }) => {
    const onFileChange = (e: Event) => {
      const input = e.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("audio/")) return;

      const reader = new FileReader();
      reader.onload = () =>
        setData({ src: String(reader.result ?? PLACEHOLDER_AUDIO) });
      reader.readAsDataURL(file);

      input.value = "";
    };

    const resetToPlaceholder = () => setData({ src: PLACEHOLDER_AUDIO });

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">${msg("Audio")}</h2>

        <div class="setting-row">
          <label
            style="
              display: block;
              font-size: var(--sl-input-label-font-size-medium);
              color: var(--sl-color-neutral-700);
              margin-bottom: 0.25rem;
            "
          >
            ${msg("Upload Audio")}
          </label>

          <input
            type="file"
            accept="audio/*"
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
            ${msg("Reset to placeholder")}
          </sl-button>
        </div>
      </div>
    `;
  },
};
