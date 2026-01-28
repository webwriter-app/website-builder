import type { LayoutMode } from "./types";

export function tileGlyph(type: string): string {
  switch (type) {
    case "h1":
      return "H1";
    case "h2":
      return "H2";
    case "h3":
      return "H3";
    case "h4":
      return "H4";
    case "h5":
      return "H5";
    case "h6":
      return "H6";
    case "paragraph":
      return "¶";
    case "label":
      return "T";
    case "image":
      return "🖼";
    case "video":
      return "▶";
    case "audio":
      return "♪";
    case "icon":
      return "★";
    case "button":
      return "▢";
    case "link":
      return "↗";
    case "divider":
      return "—";
    default:
      return type.slice(0, 2).toUpperCase();
  }
}

export function componentSyntaxHint(type: string): string {
  switch (type) {
    case "h1":
      return `<h1>Heading</h1>`;
    case "paragraph":
      return `<p>Text…</p>`;
    case "image":
      return `<img src="…" alt="…">`;
    case "button":
      return `<button>Button</button>`;
    case "link":
      return `<a href="https://…">Link</a>`;
    case "divider":
      return `<hr />`;
    case "video":
      return `<video src="…" controls></video>`;
    case "audio":
      return `<audio src="…" controls></audio>`;
    case "icon":
      return `<sl-icon name="alarm"></sl-icon>`;
    default:
      return `<!-- ${type} -->`;
  }
}

export function layoutTitle(mode: LayoutMode): string {
  switch (mode) {
    case "freeform":
      return "Freeform";
    case "flow":
      return "Flow";
    case "flex":
      return "Flex";
    case "grid":
      return "Grid";
  }
}
