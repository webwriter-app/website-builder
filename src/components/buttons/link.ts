import { html } from "lit";
import type { BuilderComponent } from "../../types/BuilderComponent";
import "../../assets/shoelaceImports";

const DEFAULT_LABEL = "Link";
const DEFAULT_HREF = "#";
const DEFAULT_ICON = "";

export const LinkComponent: BuilderComponent = {
  type: "link",
  label: "Link",
  group: "buttons",

  defaultData: {
    label: DEFAULT_LABEL,
    href: DEFAULT_HREF,
    icon: DEFAULT_ICON,
  },

  render(data) {
    const label = data?.label || DEFAULT_LABEL;
    const href = data?.href || DEFAULT_HREF;
    const icon = data?.icon || "";

    return html`
      <style>
        .link-wrap {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.6rem;
          border-radius: 4px;
          color: #2563eb;
          text-decoration: none;
          user-select: none;
          cursor: pointer;
        }

        .link-wrap:hover {
          text-decoration: underline;
          background: #f1f5ff;
        }

        sl-icon {
          font-size: 1em;
          pointer-events: none;
        }

        span {
          pointer-events: none;
        }
      </style>

      <a class="link-wrap" href=${href} target="_blank" rel="noopener">
        ${icon ? html`<sl-icon name=${icon}></sl-icon>` : null}
        <span>${label}</span>
      </a>
    `;
  },

  // Sidebar → Content
  bindings: [
    {
      key: "label",
      label: "Link text",
      kind: "text",
      target: "span",
      placeholder: "Link label",
    },
    {
      key: "href",
      label: "Link URL",
      kind: "attr",
      target: "a",
      name: "href",
      placeholder: "https://example.com",
    },
    {
      key: "icon",
      label: "Icon name (optional)",
      kind: "attr",
      target: "sl-icon",
      name: "name",
      placeholder: "arrow-right, link-45deg, external-link…",
    },
  ],

  settings: (element) => {
    const link = element.querySelector("a");
    if (!link) return html``;

    const reset = () => {
      const span = element.querySelector("span");
      const icon = element.querySelector("sl-icon");

      if (span) span.textContent = DEFAULT_LABEL;
      link.setAttribute("href", DEFAULT_HREF);
      if (icon) icon.remove();
    };

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">Link</h2>

        <div class="setting-row">
          <sl-button size="small" variant="default" @click=${reset}>
            Reset link
          </sl-button>
        </div>

        <div class="setting-row" style="font-size: 0.8rem; color: #666;">
          Opens in new tab. Icons use Shoelace (Bootstrap Icons).
        </div>
      </div>
    `;
  },
};
