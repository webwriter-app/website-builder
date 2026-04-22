import { html } from "lit";
import { msg } from "@lit/localize";
import type { BuilderComponent } from "../../types/BuilderComponent";

/**
 * Small default placeholder video (MDN demo, can be replaced later)
 */
const PLACEHOLDER_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const VideoComponent: BuilderComponent = {
  type: "video",
  label: () => msg("Video"),
  group: "media",

  defaultData: {
    src: PLACEHOLDER_VIDEO,
  },

  render(data) {
    const src = data?.src || PLACEHOLDER_VIDEO;
    const alt = data?.alt ?? "";
    const width = data?.width ?? "auto";
    const height = data?.height ?? "auto";
    const objectFit = data?.["object-fit"] ?? "contain";
    const opacity = data?.opacity ?? 1;
    const borderRadius = data?.["border-radius"] ?? "0";

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
        <video
          src=${src}
          controls
          alt=${alt}
          style="
          display: block;
          width: ${width};
          height: ${height};
          object-fit: contain;
          pointer-events: none;
          object-fit: ${objectFit};
          opacity: ${opacity};
          border-radius: ${borderRadius};
        "
        ></video>
      </div>
    `;
  },

  bindings: () => [
    {
      key: "src",
      label: msg("Video URL"),
      kind: "attr",
      target: "video",
      name: "src",
      placeholder: `https://… ${msg("or")} data:video/…`,
    },
    {
      key: "alt",
      label: msg("Alt Text"),
      kind: "attr",
      target: "video",
      name: "alt",
      placeholder: msg("Describe the video (accessibility)"),
    },
    {
      key: "width",
      label: msg("Width"),
      kind: "style",
      target: "video",
      name: "width",
      placeholder: `${msg("e.g.")} 300px`,
    },
    {
      key: "height",
      label: msg("Height"),
      kind: "style",
      target: "video",
      name: "height",
      placeholder: `${msg("e.g.")} 200px`,
    },
    {
      key: "object-fit",
      label: msg("Object Fit"),
      kind: "style",
      target: "video",
      name: "object-fit",
      placeholder: `${msg("e.g.")} contain, cover, fill`,
    },
    {
      key: "opacity",
      label: msg("Opacity"),
      kind: "style",
      target: "video",
      name: "opacity",
      placeholder: `${msg("e.g.")} 0.5`,
    },
    {
      key: "border-radius",
      label: msg("Border Radius"),
      kind: "style",
      target: "video",
      name: "border-radius",
      placeholder: `${msg("e.g.")} 8px`,
    },
  ],

  // Upload and reset belong into custom settings
  settings: ({ setData }) => {
    const onFileChange = (e: Event) => {
      const input = e.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("video/")) return;

      const reader = new FileReader();
      reader.onload = () =>
        setData({ src: String(reader.result ?? PLACEHOLDER_VIDEO) });
      reader.readAsDataURL(file);

      input.value = "";
    };

    const resetToPlaceholder = () => setData({ src: PLACEHOLDER_VIDEO });

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">${msg("Video")}</h2>

        <div class="setting-row">
          <label
            style="
              display: block;
              font-size: var(--sl-input-label-font-size-medium);
              color: var(--sl-color-neutral-700);
              margin-bottom: 0.25rem;
            "
          >
            ${msg("Upload Video")}
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
            ${msg("Reset to placeholder")}
          </sl-button>
        </div>
      </div>
    `;
  },
};
