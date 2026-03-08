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
    // ── Headings ─────────────────────────────────────────────────────────────
    case "h1":
      return `<h1>Heading 1</h1>`;
    case "h2":
      return `<h2>Heading 2</h2>`;
    case "h3":
      return `<h3>Heading 3</h3>`;
    case "h4":
      return `<h4>Heading 4</h4>`;
    case "h5":
      return `<h5>Heading 5</h5>`;
    case "h6":
      return `<h6>Heading 6</h6>`;

    // ── Text ─────────────────────────────────────────────────────────────────
    case "paragraph":
      return `<p>Your text here…</p>`;

    case "label":
      return `<span class="label">Label text</span>`;

    case "textarea":
      return `<textarea rows="4" placeholder="Enter text…"></textarea>`;

    // ── Media ─────────────────────────────────────────────────────────────────
    case "image":
      return `<img src="https://example.com/image.jpg" alt="Description">`;

    case "video":
      return (
        `<video src="https://example.com/video.mp4" controls>\n` +
        `  Your browser does not support video.\n` +
        `</video>`
      );

    case "audio":
      return (
        `<audio src="https://example.com/audio.mp3" controls>\n` +
        `  Your browser does not support audio.\n` +
        `</audio>`
      );

    case "icon":
      return (
        `<!-- requires Shoelace -->\n` + `<sl-icon name="alarm"></sl-icon>`
      );

    // ── Interactive ───────────────────────────────────────────────────────────
    case "button":
      return `<button type="button">Click me</button>`;

    case "link":
      return `<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link text</a>`;

    // ── Structure ─────────────────────────────────────────────────────────────
    case "divider":
      return `<hr>`;

    default:
      return `<!-- ${type} -->`;
  }
}

// ---------------------------------------------------------------------------
// layoutTitle
// ---------------------------------------------------------------------------

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
