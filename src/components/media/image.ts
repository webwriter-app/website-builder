import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";
import { wbPlaceholderIMG } from "../../assets/icons";

const PLACEHOLDER_SRC = wbPlaceholderIMG;

export const ImageComponent: BuilderComponent = {
  type: "image",
  label: "Image",
  group: "media",

  defaultData: {
    src: PLACEHOLDER_SRC,
    alt: "Placeholder image",
  },

  render(data) {
    const src = data?.src || PLACEHOLDER_SRC;
    const alt = data?.alt ?? "";

    return html`
      <img
        src=${src}
        alt=${alt}
        style="
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
        "
      />
    `;
  },

  // Only fields that are useful in the generic "Content" section
  bindings: [
    {
      key: "src",
      label: "Image URL",
      kind: "attr",
      target: "img",
      name: "src",
      placeholder: "https://… or data:image/…",
    },
    {
      key: "alt",
      label: "Alt Text",
      kind: "attr",
      target: "img",
      name: "alt",
      placeholder: "Describe the image (accessibility)",
    },
  ],

  // Upload is now grouped with the other image-related controls
  settings: (element) => {
    const img = element.querySelector("img") as HTMLImageElement | null;
    if (!img) return html``;

    const onFileChange = (e: Event) => {
      const input = e.currentTarget as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = () => {
        img.src = String(reader.result ?? PLACEHOLDER_SRC);
      };
      reader.readAsDataURL(file);

      // allow re-uploading the same file
      input.value = "";
    };

    const resetToPlaceholder = () => {
      img.src = PLACEHOLDER_SRC;
      img.alt = "Placeholder image";
    };

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">Image</h2>

        <div class="setting-row">
          <label
            style="
              display: block;
              font-size: var(--sl-input-label-font-size-medium);
              color: var(--sl-color-neutral-700);
              margin-bottom: 0.25rem;
            "
          >
            Upload Image
          </label>

          <input
            type="file"
            accept="image/*"
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
