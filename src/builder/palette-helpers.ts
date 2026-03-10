import type { LayoutMode } from "./types";
import { wbAudioIcon, wbButtonIcon, wbDividerIcon, wbH1Icon, wbH2Icon, wbH4Icon, wbH3Icon, wbIconIcon, wbImageIcon, wbTextIcon, wbH6Icon, wbH5Icon, wbLabelIcon, wbVideoIcon, wbLinkIcon, wbTextareaIcon } from "../assets/icons";
import { TemplateResult } from "lit";

export function tileGlyph(type: string): TemplateResult | string {
  switch (type) {
    case "h1":
      return wbH1Icon;
    case "h2":
      return wbH2Icon;
    case "h3":
      return wbH3Icon;
    case "h4":
      return wbH4Icon;
    case "h5":
      return wbH5Icon;
    case "h6":
      return wbH6Icon;
    case "paragraph":
      return wbTextIcon;
    case "label":
      return wbLabelIcon;
    case "image":
      return wbImageIcon;
    case "video":
      return wbVideoIcon;
    case "audio":
      return wbAudioIcon;
    case "icon":
      return wbIconIcon;
    case "button":
      return wbButtonIcon;
    case "link":
      return wbLinkIcon;
    case "divider":
      return wbDividerIcon;
    case "textarea":
      return wbTextareaIcon;
    case "container":
      return "⬚";
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

    // ── Container ─────────────────────────────────────────────────────────────
    case "container":
      return (
        `<div class="container" style="display:flex; gap:12px;">\n` +
        `  <!-- nested components go here -->\n` +
        `</div>`
      );

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
