import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";

export const ImageComponent: BuilderComponent = {
  type: "image",

  render: () => html`
    <style>
      .resizable {
        display: inline-block;
        resize: both;
        overflow: hidden;
        border: 1px solid #ccc;
        min-width: 50px;
        min-height: 50px;
        width: auto;
        height: auto;
      }

      .resizable img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
    </style>

    <div class="resizable">
      <img
        src="https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80"
        alt="Color version of kittens in a basket looking around."
      />
    </div>
  `,
};
