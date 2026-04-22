import { css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { msg } from "@lit/localize";
import { LitElementWw } from "@webwriter/lit";
import "../../../assets/shoelaceImports";
import { shoelaceScoped } from "../../../assets/shoelaceImports";
import { SHOELACE_ICON_NAMES } from "../../data/shoelaceIcons";

export class WwIconPicker extends LitElementWw {
  static get scopedElements() {
    return {
      ...shoelaceScoped,
    };
  }

  static styles = css`
    :host {
      display: block;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.55rem;
      border-radius: 999px;
      border: 1px solid var(--sl-color-neutral-200);
      background: var(--sl-color-neutral-0);
    }

    .chip sl-icon {
      font-size: 18px;
    }

    .chip .name {
      font-size: 0.85rem;
      color: var(--sl-color-neutral-700);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Dialog content */
    

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .hint {
      font-size: 0.8rem;
      color: var(--sl-color-neutral-600);
    }
  `;

  @property({ type: String }) value = "gear";
  @property({ type: String }) color = "#0f172a";
  @property({ type: String }) size = "18px";

  @property({ type: String, attribute: "button-label" }) buttonLabel =
    msg("Choose icon…");
  @property({ type: String, attribute: "search-placeholder" })
  searchPlaceholder = msg("Search icons…");

  private _openDialog() {
    this.dispatchEvent(
      new CustomEvent("ww-icon-picker-open", {
        detail: {
          name: this.value || "gear",
          color: this.color || "#0f172a",
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="row">

        <sl-button size="small" variant="default" @click=${this._openDialog}>
          ${this.buttonLabel}
        </sl-button>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("ww-icon-picker-result", (e: any) => {
      const { name, color } = e.detail ?? {};
      if (!name) return;

      this.value = name;
      this.color = color ?? this.color;

      this.dispatchEvent(
        new CustomEvent("ww-change", {
          detail: { name: this.value, color: this.color },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ww-icon-picker": WwIconPicker;
  }
}
