import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const ImageComponent: BuilderComponent = {
  type: "image",
  label: "Image",
  group: "media",

  defaultData: {
    src: "",
    alt: "",
    objectFit: "contain",
  },

  render(data) {
    return html`
      <img
        src=${data.src}
        alt=${data.alt}
        style="
          display: block;
          width: 100%;
          height: 100%;
          object-fit: ${data.objectFit};
          pointer-events: none;
        "
      />
    `;
  },

  settings: (element) => {
    const img = element.querySelector("img") as HTMLImageElement | null;
    if (!img) return html``;

    return html`
      <sl-input
        label="Image URL"
        .value=${img.src}
        @sl-change=${(e: any) => {
          img.src = e.target.value;
        }}
      ></sl-input>

      <sl-input
        label="Alt Text"
        .value=${img.alt}
        @sl-change=${(e: any) => {
          img.alt = e.target.value;
        }}
      ></sl-input>

      <sl-select
        label="Object Fit"
        value=${img.style.objectFit || "contain"}
        @sl-change=${(e: any) => {
          img.style.objectFit = e.target.value;
        }}
      >
        <sl-option value="contain">Contain</sl-option>
        <sl-option value="cover">Cover</sl-option>
        <sl-option value="fill">Fill</sl-option>
        <sl-option value="none">None</sl-option>
      </sl-select>

      <sl-input
        type="search"
        label="Upload Image"
        accept="image/*"
        @sl-change=${(e: any) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = () => {
            img.src = reader.result as string;
          };
          reader.readAsDataURL(file);
        }}
      ></sl-input>
    `;
  },
};
