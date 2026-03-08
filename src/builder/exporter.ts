import type {
  BuilderNode,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "./types";
import { sortedNodes } from "./layout";

// ---------------------------------------------------------------------------
// HTML tree types
// ---------------------------------------------------------------------------

type HtmlText = { kind: "text"; value: string };

type HtmlElement = {
  kind: "element";
  tag: string;
  attrs: Record<string, string | null>; // null = boolean attribute (no value)
  children: HtmlNode[];
  selfClosing?: boolean; // <img>, <hr>, etc.
};

type HtmlComment = { kind: "comment"; value: string };

type HtmlNode = HtmlElement | HtmlText | HtmlComment;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(s: unknown): string {
  if (s == null) return "";
  return String(s).replaceAll('"', "&quot;");
}

/** Detect base64 blob / object-URL src values that are unusable outside the builder */
function isBlobSrc(src: unknown): boolean {
  if (typeof src !== "string") return true; // missing is also unusable
  const s = src.trim();
  return (
    s === "" ||
    s.startsWith("blob:") ||
    // extremely long data URIs are technically valid but bloat the export
    (s.startsWith("data:") && s.length > 8192)
  );
}

// ---------------------------------------------------------------------------
// Tree builder
// ---------------------------------------------------------------------------

function el(
  tag: string,
  attrs: Record<string, string | null>,
  ...children: HtmlNode[]
): HtmlElement {
  return { kind: "element", tag, attrs, children };
}

function selfClose(
  tag: string,
  attrs: Record<string, string | null>,
): HtmlElement {
  return { kind: "element", tag, attrs, children: [], selfClosing: true };
}

function text(value: string): HtmlText {
  return { kind: "text", value };
}

function comment(value: string): HtmlComment {
  return { kind: "comment", value };
}

// ---------------------------------------------------------------------------
// Serialiser (prettier-style recursive, 2-space indent)
// ---------------------------------------------------------------------------

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img",
  "input", "link", "meta", "param", "source", "track", "wbr",
]);

/**
 * Serialize an HtmlNode tree to a string.
 * Block-level elements get their own line + indent; inline/text stays on one line.
 */
function serialize(node: HtmlNode, depth = 0): string {
  const pad = "  ".repeat(depth);

  if (node.kind === "text") {
    return pad + escapeHtml(node.value);
  }

  if (node.kind === "comment") {
    return `${pad}<!-- ${node.value} -->`;
  }

  // element
  const attrStr = Object.entries(node.attrs)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => (v === null ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`))
    .join("");

  const isVoid = VOID_TAGS.has(node.tag) || node.selfClosing;

  if (isVoid) {
    return `${pad}<${node.tag}${attrStr}>`;
  }

  if (node.children.length === 0) {
    return `${pad}<${node.tag}${attrStr}></${node.tag}>`;
  }

  // Single text child → keep on one line for readability
  if (
    node.children.length === 1 &&
    node.children[0].kind === "text"
  ) {
    const inner = escapeHtml((node.children[0] as HtmlText).value);
    return `${pad}<${node.tag}${attrStr}>${inner}</${node.tag}>`;
  }

  // Multiple / complex children → each on its own indented line
  const inner = node.children
    .map((c) => serialize(c, depth + 1))
    .join("\n");

  return `${pad}<${node.tag}${attrStr}>\n${inner}\n${pad}</${node.tag}>`;
}

// ---------------------------------------------------------------------------
// Component → HtmlNode
// ---------------------------------------------------------------------------

function componentToNode(n: BuilderNode): HtmlNode {
  const t = n.type;
  const d = n.data ?? {};

  switch (t) {
    // ── Text ────────────────────────────────────────────────────────────────
    case "h1":
      return el("h1", {}, text(String(d.text ?? d.value ?? "Heading")));

    case "h2":
      return el("h2", {}, text(String(d.text ?? d.value ?? "Heading")));

    case "h3":
      return el("h3", {}, text(String(d.text ?? d.value ?? "Heading")));

    case "paragraph":
      return el("p", {}, text(String(d.text ?? d.value ?? "Text…")));

    case "blockquote":
      return el("blockquote", {}, text(String(d.text ?? d.value ?? "")));

    case "code": {
      const lang = d.language ? { "data-lang": String(d.language) } : {};
      return el("pre", {}, el("code", lang, text(String(d.text ?? d.value ?? ""))));
    }

    // ── Media ────────────────────────────────────────────────────────────────
    case "image": {
      const src = d.src ?? "";
      if (isBlobSrc(src)) {
        return el(
          "figure",
          { class: "media-placeholder" },
          comment("image: replace src with a real URL"),
          selfClose("img", { src: "", alt: escapeAttr(d.alt ?? ""), width: d.width ? String(d.width) : null }),
        );
      }
      const attrs: Record<string, string | null> = {
        src: escapeAttr(src),
        alt: escapeAttr(d.alt ?? ""),
      };
      if (d.width) attrs.width = String(d.width);
      if (d.height) attrs.height = String(d.height);
      return selfClose("img", attrs);
    }

    case "video": {
      const src = d.src ?? "";
      if (isBlobSrc(src)) {
        return el(
          "figure",
          { class: "media-placeholder" },
          comment("video: replace src with a real URL"),
          el("video", { src: "", controls: null }),
        );
      }
      return el("video", { src: escapeAttr(src), controls: null });
    }

    case "audio": {
      const src = d.src ?? "";
      if (isBlobSrc(src)) {
        return el(
          "figure",
          { class: "media-placeholder" },
          comment("audio: replace src with a real URL"),
          el("audio", { src: "", controls: null }),
        );
      }
      return el("audio", { src: escapeAttr(src), controls: null });
    }

    // ── Interactive ──────────────────────────────────────────────────────────
    case "button":
      return el(
        "button",
        { type: "button" },
        text(String(d.label ?? "Button")),
      );

    case "link": {
      const href = d.href ?? "#";
      const label = String(d.label ?? "Link");
      return el(
        "a",
        { href: escapeAttr(href), target: "_blank", rel: "noopener noreferrer" },
        text(label),
      );
    }

    // ── Icon (Shoelace) ──────────────────────────────────────────────────────
    case "icon": {
      const name = String(d.name ?? "gear");
      const attrs: Record<string, string | null> = { name };
      if (d.color) attrs.style = `color:${escapeAttr(d.color)};`;
      // sl-icon is a void-ish custom element with no children needed
      return el("sl-icon", attrs);
    }

    // ── Structure ────────────────────────────────────────────────────────────
    case "divider":
      return selfClose("hr", {});

    case "spacer": {
      const size = d.size ? `height:${escapeAttr(d.size)};` : "height:1rem;";
      return el("div", { class: "spacer", style: size });
    }

    case "list": {
      const items: string[] = Array.isArray(d.items)
        ? d.items.map(String)
        : [String(d.text ?? "")];
      const tag = d.ordered ? "ol" : "ul";
      return el(tag, {}, ...items.map((i) => el("li", {}, text(i))));
    }

    case "table": {
      const rows: string[][] = Array.isArray(d.rows) ? d.rows : [["Cell"]];
      const hasHead = Boolean(d.header);
      const tableRows = rows.map((row, ri) => {
        const cellTag = hasHead && ri === 0 ? "th" : "td";
        const cells = Array.isArray(row)
          ? row.map((c) => el(cellTag, {}, text(String(c))))
          : [el(cellTag, {}, text(String(row)))];
        return el("tr", {}, ...cells);
      });
      return el("table", {}, ...tableRows);
    }

    default:
      return comment(`unsupported component: ${t}`);
  }
}

// ---------------------------------------------------------------------------
// Grid item wrapper style
// ---------------------------------------------------------------------------

function gridItemStyle(n: BuilderNode): string {
  const g: any = (n as any).grid ?? {};
  const css: string[] = [];

  const area = String(g.area ?? "").trim();
  if (area) {
    css.push(`grid-area:${area}`);
  } else {
    if (typeof g.colStart === "number") {
      const span = Math.max(1, Number(g.colSpan ?? 1));
      css.push(`grid-column:${g.colStart} / span ${span}`);
    } else if (typeof g.colSpan === "number") {
      css.push(`grid-column:span ${Math.max(1, g.colSpan)}`);
    }
    if (typeof g.rowStart === "number") {
      const span = Math.max(1, Number(g.rowSpan ?? 1));
      css.push(`grid-row:${g.rowStart} / span ${span}`);
    } else if (typeof g.rowSpan === "number") {
      css.push(`grid-row:span ${Math.max(1, g.rowSpan)}`);
    }
  }

  if (g.justifySelf) css.push(`justify-self:${g.justifySelf}`);
  if (g.alignSelf) css.push(`align-self:${g.alignSelf}`);

  return css.join(";");
}

// ---------------------------------------------------------------------------
// Main exporter class
// ---------------------------------------------------------------------------

export class BuilderExporter {
  generateExport(args: {
    layoutMode: LayoutMode;
    nodes: BuilderNode[];
    flexSettings: FlexSettings;
    gridSettings: GridSettings;
  }): { html: string; css: string; combined: string } {
    const sorted = sortedNodes(args.nodes);

    // ── Container class ──────────────────────────────────────────────────────
    const containerClass = {
      freeform: "page page--freeform",
      flow:     "page page--flow",
      flex:     "page page--flex",
      grid:     "page page--grid",
    }[args.layoutMode];

    // ── Build wrapper nodes ──────────────────────────────────────────────────
    const wrapperNodes: HtmlNode[] = sorted.map((n): HtmlNode => {
      const inner = componentToNode(n);

      if (args.layoutMode === "freeform") {
        const pos = n.pos ?? { x: 0, y: 0 };
        return el(
          "div",
          {
            class: "el",
            style: `left:${Math.round(pos.x)}px;top:${Math.round(pos.y)}px`,
          },
          inner,
        );
      }

      const display = n.display ?? "block";
      const cls = display === "inline" ? "el el--inline" : "el";
      const style =
        args.layoutMode === "grid" ? gridItemStyle(n) : null;

      return el(
        "div",
        { class: cls, ...(style ? { style } : {}) },
        inner,
      );
    });

    // ── Root tree ────────────────────────────────────────────────────────────
    const root = el(
      "div",
      { class: containerClass },
      ...wrapperNodes,
    );

    const topLevel: HtmlNode[] = [
      comment("Generated by webwriter-website-builder"),
      root,
    ];

    const htmlOut = topLevel.map((n) => serialize(n, 0)).join("\n");

    // ── CSS ──────────────────────────────────────────────────────────────────
    const { flex, grid } = { flex: args.flexSettings, grid: args.gridSettings };
    const gridAreas =
      grid.templateAreas?.trim()
        ? `  grid-template-areas: ${grid.templateAreas};`
        : "";

    const cssOut = `/* Generated by webwriter-website-builder */

/* ── Reset / base ─────────────────────────────────────────────────── */
.page {
  box-sizing: border-box;
  padding: 16px;
  background: #fff;
  color: #0f172a;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.5;
}

.page *,
.page *::before,
.page *::after {
  box-sizing: inherit;
}

.page img,
.page video {
  max-width: 100%;
  height: auto;
  display: block;
}

/* ── Freeform ──────────────────────────────────────────────────────── */
.page--freeform {
  position: relative;
  min-height: 600px;
}

.page--freeform .el {
  position: absolute;
}

/* ── Flow ──────────────────────────────────────────────────────────── */
.page--flow .el--inline {
  display: inline-block;
}

/* ── Flex ──────────────────────────────────────────────────────────── */
.page--flex {
  display: flex;
  flex-direction: ${flex.direction ?? "row"};
  justify-content: ${flex.justify ?? "flex-start"};
  align-items: ${flex.align ?? "stretch"};
  flex-wrap: ${flex.wrap ?? "nowrap"};
  gap: ${flex.gap ?? "12px"};
}

/* ── Grid ──────────────────────────────────────────────────────────── */
.page--grid {
  display: grid;
  grid-template-columns: ${grid.columns ?? "repeat(3, 1fr)"};
  grid-auto-rows: ${grid.rows ?? "auto"};
  gap: ${grid.gap ?? "12px"};
  grid-auto-flow: ${grid.autoFlow ?? "row"};
  justify-items: ${grid.justifyItems ?? "stretch"};
  align-items: ${grid.alignItems ?? "start"};
${gridAreas}
}

/* ── Media placeholder ─────────────────────────────────────────────── */
.media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #94a3b8;
  font-size: 0.85rem;
  min-height: 120px;
  margin: 0;
}

/* ── Spacer ────────────────────────────────────────────────────────── */
.spacer {
  display: block;
}
`;

    const combined = `<!-- HTML -->\n${htmlOut}\n\n<style>\n${cssOut}\n</style>`;

    return { html: htmlOut, css: cssOut, combined };
  }
}