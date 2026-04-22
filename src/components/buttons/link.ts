import { html } from "lit";
import { msg } from "@lit/localize";
import type { BuilderComponent } from "../../types/BuilderComponent";
import "../../assets/shoelaceImports";

const DEFAULT_LABEL = "Link";
const DEFAULT_HREF = "#";
const DEFAULT_ICON = "";

export const LinkComponent: BuilderComponent = {
  type: "link",
  label: () => msg("Link"),
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

  bindings: () => [
    {
      key: "label",
      label: msg("Link text"),
      kind: "text",
      target: "span",
      placeholder: msg("Link label"),
    },
    {
      key: "href",
      label: msg("Link URL"),
      kind: "attr",
      target: "a",
      name: "href",
      placeholder: "https://example.com",
    },
    {
      key: "icon",
      label: msg("Icon name (optional)"),
      kind: "attr",
      target: "sl-icon",
      name: "name",
      placeholder: "arrow-right, link-45deg, external-link…",
    },
  ],

  settings: ({ setData }) => {
    const reset = () => {
      setData({ label: DEFAULT_LABEL, href: DEFAULT_HREF, icon: DEFAULT_ICON });
    };

    return html`
      <div style="margin-top: 1rem">
        <h2 style="margin-top: 0">${msg("Link")}</h2>

        <div class="setting-row">
          <sl-button size="small" variant="default" @click=${reset}>
            ${msg("Reset link")}
          </sl-button>
        </div>

        <div class="setting-row" style="font-size: 0.8rem; color: #666;">
          ${msg('Press "A" while clicking to follow the link.')}
        </div>
      </div>
    `;
  },
};
