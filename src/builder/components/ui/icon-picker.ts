import { css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { LitElementWw } from "@webwriter/lit";
import "../../../assets/shoelaceImports";
import { shoelaceScoped } from "../../../assets/shoelaceImports";
import { SHOELACE_ICON_NAMES } from "../../data/shoelaceIcons";

type IconPickDetail = { name: string; color: string };

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
    "Choose icon…";
  @property({ type: String, attribute: "search-placeholder" })
  searchPlaceholder = "Search icons…";

  @state() private _open = false;
  @state() private _query = "";
  @state() private _draftName = "";
  @state() private _draftColor = "";

  @state() private _scrollTop = 0;
  @state() private _viewportH = 520;

  private _scroller: HTMLElement | null = null;

  // virtualization tuning (smaller overscan = fewer icons rendered = less lag)
  private readonly ROW_H = 60;
  private readonly OVERSCAN = 3;

  private get _filtered(): string[] {
    const q = this._query.trim().toLowerCase();
    if (!q) return SHOELACE_ICON_NAMES;
    return SHOELACE_ICON_NAMES.filter((n) => n.toLowerCase().includes(q));
  }

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

  private _closeDialog() {
    const dlg = this.renderRoot.querySelector("sl-dialog") as any;
    dlg?.hide?.();
    this._open = false;
  }

  private _commit() {
    this.value = this._draftName || this.value;
    this.color = this._draftColor || this.color;

    const detail: IconPickDetail = { name: this.value, color: this.color };

    this.dispatchEvent(
      new CustomEvent("ww-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );

    this._closeDialog();
  }

  private _onAfterShow = () => {
    this._scroller = this.renderRoot.querySelector(
      ".scroller",
    ) as HTMLElement | null;
    if (this._scroller) {
      this._scrollTop = this._scroller.scrollTop;
      this._viewportH = this._scroller.clientHeight;
      this._scroller.addEventListener("scroll", this._onScroll, {
        passive: true,
      });
    }

    // focus search
    queueMicrotask(() => {
      const input = this.renderRoot.querySelector(
        'sl-input[name="search"]',
      ) as any;
      input?.focus?.();
    });
  };

  private _onAfterHide = () => {
    if (this._scroller)
      this._scroller.removeEventListener("scroll", this._onScroll);
    this._scroller = null;
    this._getBuilderHost()?.removeAttribute("data-ww-modal-open");
  };

  private _onScroll = () => {
    if (!this._scroller) return;
    this._scrollTop = this._scroller.scrollTop;
    this._viewportH = this._scroller.clientHeight;
  };

  private _getBuilderHost(): HTMLElement | null {
    return this.closest("webwriter-website-builder") as HTMLElement | null;
  }

  private _renderVirtualGrid(items: string[]) {
    const width = this._scroller?.clientWidth ?? 760;
    const minCol = 56;
    const cols = Math.max(1, Math.floor((width - 24) / (minCol + 6)));

    const totalRows = Math.ceil(items.length / cols);
    const spacerH = totalRows * this.ROW_H;

    const startRow = Math.max(
      0,
      Math.floor(this._scrollTop / this.ROW_H) - this.OVERSCAN,
    );
    const endRow = Math.min(
      totalRows,
      Math.ceil((this._scrollTop + this._viewportH) / this.ROW_H) +
        this.OVERSCAN,
    );

    const startIndex = startRow * cols;
    const endIndex = Math.min(items.length, endRow * cols);
    const slice = items.slice(startIndex, endIndex);

    const offsetY = startRow * this.ROW_H;

    return html`
      <div class="spacer" style="--spacer-h:${spacerH}px"></div>
      <div class="grid" style="transform: translateY(${offsetY}px);">
        ${slice.map((name) => {
          const selected = name === this._draftName;
          return html`
            <button
              class="tile"
              data-selected=${selected ? "true" : "false"}
              type="button"
              title=${name}
              @click=${() => (this._draftName = name)}
            >
              <sl-icon
                name=${name}
                style="color:${this._draftColor};"
              ></sl-icon>
              <span class="fallback">${name.slice(0, 2)}</span>
            </button>
          `;
        })}
      </div>
    `;
  }

  render() {
    const chipName = this.value || "gear";
    const chipColor = this.color || "currentColor";
    const items = this._filtered;

    return html`
      <div class="row">
        <div class="chip" title=${chipName}>
          <sl-icon
            name=${chipName}
            style="color:${chipColor}; font-size:${this.size};"
          ></sl-icon>
          <div class="name">${chipName}</div>
        </div>

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
