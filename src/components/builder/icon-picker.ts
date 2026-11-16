import { css, html } from "lit";
import { property } from "lit/decorators.js";
import { LitElementWw } from "@webwriter/lit";
import { widgetMsg } from "@webwriter/lit/localize";
import { shoelaceScoped } from "../shoelace-imports";

export class WwIconPicker extends LitElementWw {
  static scopedElements = { ...shoelaceScoped };

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

  private readonly msg = widgetMsg(this);

  @property({ type: String }) accessor value = "gear";
  @property({ type: String }) accessor color = "#0f172a";
  @property({ type: String }) accessor size = "18px";

  @property({ type: String, attribute: "button-label" }) accessor buttonLabel: string | undefined;
  @property({ type: String, attribute: "search-placeholder" })
  accessor searchPlaceholder: string | undefined;

  #listeners?: AbortController;

  connectedCallback() {
    super.connectedCallback();
    this.#listeners = new AbortController();
    this.addEventListener("ww-icon-picker-result", this._onResult, {
      signal: this.#listeners.signal,
    });
  }

  disconnectedCallback() {
    this.#listeners?.abort();
    super.disconnectedCallback();
  }

  private _onResult = (e: Event) => {
    const { name, color } =
      (e as CustomEvent<{ name?: string; color?: string }>).detail ?? {};
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
  };

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
          ${this.buttonLabel ?? this.msg("Choose icon…")}
        </sl-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ww-icon-picker": WwIconPicker;
  }
}
