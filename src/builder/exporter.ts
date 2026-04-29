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
  attrs: Record<string, string | null>;
  children: HtmlNode[];
  selfClosing?: boolean;
};
type HtmlComment = { kind: "comment"; value: string };
type HtmlNode = HtmlElement | HtmlText | HtmlComment;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function escapeAttr(s: unknown): string {
  if (s == null) return "";
  return String(s).replaceAll('"', "&quot;");
}
function isBlobSrc(src: unknown): boolean {
  if (typeof src !== "string") return true;
  const s = src.trim();
  return s === "" || s.startsWith("blob:") || (s.startsWith("data:") && s.length > 8192);
}

// ---------------------------------------------------------------------------
// Tree builder
// ---------------------------------------------------------------------------

function el(tag: string, attrs: Record<string, string | null>, ...children: HtmlNode[]): HtmlElement {
  return { kind: "element", tag, attrs, children };
}
function selfClose(tag: string, attrs: Record<string, string | null>): HtmlElement {
  return { kind: "element", tag, attrs, children: [], selfClosing: true };
}
function text(value: string): HtmlText { return { kind: "text", value }; }
function comment(value: string): HtmlComment { return { kind: "comment", value }; }

// ---------------------------------------------------------------------------
// Serialiser
// ---------------------------------------------------------------------------

const VOID_TAGS = new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);

function serialize(node: HtmlNode, depth = 0): string {
  const pad = "  ".repeat(depth);
  if (node.kind === "text") return pad + escapeHtml(node.value);
  if (node.kind === "comment") return `${pad}<!-- ${node.value} -->`;

  const attrStr = Object.entries(node.attrs)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => (v === null ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`))
    .join("");

  const isVoid = VOID_TAGS.has(node.tag) || node.selfClosing;
  if (isVoid) return `${pad}<${node.tag}${attrStr}>`;
  if (node.children.length === 0) return `${pad}<${node.tag}${attrStr}></${node.tag}>`;
  if (node.children.length === 1 && node.children[0].kind === "text") {
    const inner = escapeHtml((node.children[0] as HtmlText).value);
    return `${pad}<${node.tag}${attrStr}>${inner}</${node.tag}>`;
  }
  const inner = node.children.map((c) => serialize(c, depth + 1)).join("\n");
  return `${pad}<${node.tag}${attrStr}>\n${inner}\n${pad}</${node.tag}>`;
}

// ---------------------------------------------------------------------------
// Component → HtmlNode
// ---------------------------------------------------------------------------

function textStyle(d: Record<string, unknown>): string | null {
  const parts: string[] = [];
  if (d.color && d.color !== "#000000") parts.push(`color:${escapeAttr(d.color)}`);
  if (d["font-weight"] && d["font-weight"] !== "normal") parts.push(`font-weight:${escapeAttr(d["font-weight"])}`);
  if (d["font-size"] && d["font-size"] !== "1em") parts.push(`font-size:${escapeAttr(d["font-size"])}`);
  if (d.width) parts.push(`width:${escapeAttr(d.width)}`);
  if (d.height) parts.push(`height:${escapeAttr(d.height)}`);
  return parts.length ? parts.join(";") : null;
}

function componentToNode(n: BuilderNode): HtmlNode {
  if (n.isContainer || n.type === "container") return containerToNode(n);

  const t = n.type;
  const d = n.data ?? {};

  switch (t) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      const style = textStyle(d);
      return el(t, style ? { style } : {}, text(String(d.content ?? d.text ?? d.value ?? "Heading")));
    }

    case "paragraph": {
      const style = textStyle(d);
      return el("p", style ? { style } : {}, text(String(d.content ?? d.text ?? d.value ?? "Text…")));
    }

    case "label": {
      const style = textStyle(d);
      return el("label", style ? { style } : {}, text(String(d.content ?? d.text ?? d.value ?? "Label")));
    }

    case "textarea": {
      const attrs: Record<string, string | null> = {};
      if (d.placeholder) attrs.placeholder = escapeAttr(d.placeholder);
      const parts: string[] = [];
      if (d.color && d.color !== "#000000") parts.push(`color:${escapeAttr(d.color)}`);
      if (d["font-family"] || d.font) parts.push(`font-family:${escapeAttr((d["font-family"] ?? d.font) as string)}`);
      if (d["font-weight"] && d["font-weight"] !== "normal") parts.push(`font-weight:${escapeAttr(d["font-weight"])}`);
      if (d["font-size"] && d["font-size"] !== "1em") parts.push(`font-size:${escapeAttr(d["font-size"])}`);
      if (d.width) parts.push(`width:${escapeAttr(d.width)}`);
      if (d.height) parts.push(`height:${escapeAttr(d.height)}`);
      if (parts.length) attrs.style = parts.join(";");
      return el("textarea", attrs);
    }

    case "blockquote": return el("blockquote", {}, text(String(d.content ?? d.text ?? d.value ?? "")));

    case "code": {
      const lang = d.language ? { "data-lang": String(d.language) } : {};
      return el("pre", {}, el("code", lang, text(String(d.text ?? d.value ?? ""))));
    }

    case "image": {
      const src = d.src ?? "";
      if (isBlobSrc(src)) {
        return el("figure", { class: "media-placeholder" },
          comment("image: replace src with a real URL"),
          selfClose("img", { src: "", alt: escapeAttr(d.alt ?? ""), width: d.width ? String(d.width) : null }),
        );
      }
      const attrs: Record<string, string | null> = { src: escapeAttr(src), alt: escapeAttr(d.alt ?? "") };
      if (d.width)  attrs.width  = String(d.width);
      if (d.height) attrs.height = String(d.height);
      return selfClose("img", attrs);
    }

    case "video": {
      const src = d.src ?? "";
      if (isBlobSrc(src)) return el("figure", { class: "media-placeholder" }, comment("video: replace src with a real URL"), el("video", { src: "", controls: null }));
      return el("video", { src: escapeAttr(src), controls: null });
    }

    case "audio": {
      const src = d.src ?? "";
      if (isBlobSrc(src)) return el("figure", { class: "media-placeholder" }, comment("audio: replace src with a real URL"), el("audio", { src: "", controls: null }));
      return el("audio", { src: escapeAttr(src), controls: null });
    }

    case "button": {
      const attrs: Record<string, string | null> = { type: "button" };
      const btnParts: string[] = [];
      if (d.labelColor && d.labelColor !== "#0f172a") btnParts.push(`color:${escapeAttr(d.labelColor)}`);
      if (btnParts.length) attrs.style = btnParts.join(";");
      return el("button", attrs, text(String(d.label ?? "Button")));
    }

    case "link": {
      return el("a", { href: escapeAttr(d.href ?? "#"), target: "_blank", rel: "noopener noreferrer" }, text(String(d.label ?? d.content ?? "Link")));
    }

    case "icon": {
      const attrs: Record<string, string | null> = { name: String(d.name ?? "gear") };
      if (d.color) attrs.style = `color:${escapeAttr(d.color)};`;
      return el("sl-icon", attrs);
    }

    case "divider": return selfClose("hr", {});

    case "spacer": {
      return el("div", { class: "spacer", style: d.size ? `height:${escapeAttr(d.size)};` : "height:1rem;" });
    }

    case "list": {
      const items: string[] = Array.isArray(d.items) ? d.items.map(String) : [String(d.text ?? "")];
      return el(d.ordered ? "ol" : "ul", {}, ...items.map((i) => el("li", {}, text(i))));
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

    default: return comment(`unsupported component: ${t}`);
  }
}

// ---------------------------------------------------------------------------
// Container → HtmlNode (recursive)
// ---------------------------------------------------------------------------

function containerInlineStyle(n: BuilderNode): string {
  const layout = n.containerLayout ?? "flex";
  const css: string[] = [];
  if (layout === "flex") {
    const f = n.containerFlexSettings ?? {};
    css.push("display:flex");
    if (f.direction) css.push(`flex-direction:${f.direction}`);
    if (f.justify)   css.push(`justify-content:${f.justify}`);
    if (f.align)     css.push(`align-items:${f.align}`);
    if (f.wrap)      css.push(`flex-wrap:${f.wrap}`);
    if (f.gap)       css.push(`gap:${f.gap}`);
  } else if (layout === "grid") {
    const g = n.containerGridSettings ?? {};
    css.push("display:grid");
    if (g.columns)              css.push(`grid-template-columns:${g.columns}`);
    if (g.rows)                 css.push(`grid-auto-rows:${g.rows}`);
    if (g.gap)                  css.push(`gap:${g.gap}`);
    if (g.autoFlow)             css.push(`grid-auto-flow:${g.autoFlow}`);
    if (g.justifyItems)         css.push(`justify-items:${g.justifyItems}`);
    if (g.alignItems)           css.push(`align-items:${g.alignItems}`);
  }
  return css.join(";");
}

function gridItemStyle(n: BuilderNode): string {
  const g: any = (n as any).grid ?? {};
  const css: string[] = [];
  const area = String(g.area ?? "").trim();
  if (area) {
    css.push(`grid-area:${area}`);
  } else {
    if (typeof g.colStart === "number") css.push(`grid-column:${g.colStart} / span ${Math.max(1, Number(g.colSpan ?? 1))}`);
    else if (typeof g.colSpan === "number") css.push(`grid-column:span ${Math.max(1, g.colSpan)}`);
    if (typeof g.rowStart === "number") css.push(`grid-row:${g.rowStart} / span ${Math.max(1, Number(g.rowSpan ?? 1))}`);
    else if (typeof g.rowSpan === "number") css.push(`grid-row:span ${Math.max(1, g.rowSpan)}`);
  }
  if (g.justifySelf) css.push(`justify-self:${g.justifySelf}`);
  if (g.alignSelf)   css.push(`align-self:${g.alignSelf}`);
  return css.join(";");
}

function flexItemInlineStyle(n: BuilderNode): string {
  const fi = (n as any).flexItem;
  if (!fi) return "";
  const css: string[] = [];
  if (fi.flexGrow  != null) css.push(`flex-grow:${fi.flexGrow}`);
  if (fi.flexShrink != null) css.push(`flex-shrink:${fi.flexShrink}`);
  if (fi.flexBasis)          css.push(`flex-basis:${fi.flexBasis}`);
  if (fi.alignSelf)          css.push(`align-self:${fi.alignSelf}`);
  return css.join(";");
}

function containerToNode(n: BuilderNode): HtmlNode {
  const children = sortedNodes(n.children ?? []);
  const style = containerInlineStyle(n);
  const attrs: Record<string, string | null> = { class: "container" };
  if (style) attrs.style = style;

  const childNodes = children.map((child): HtmlNode => {
    const inner = componentToNode(child);
    const gridStyle = n.containerLayout === "grid" ? gridItemStyle(child) : "";
    const flexStyle = n.containerLayout === "flex" ? flexItemInlineStyle(child) : "";
    const combined  = [gridStyle, flexStyle].filter(Boolean).join(";");
    const wrapAttrs: Record<string, string | null> = {
      class: child.display === "inline" ? "el el--inline" : "el",
    };
    if (combined) wrapAttrs.style = combined;
    return el("div", wrapAttrs, inner);
  });

  return el("div", attrs, ...childNodes);
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

    const containerClass = {
      freeform: "page page--freeform",
      flow:     "page page--flow",
      flex:     "page page--flex",
      grid:     "page page--grid",
    }[args.layoutMode];

    const wrapperNodes: HtmlNode[] = sorted.map((n): HtmlNode => {
      const inner = componentToNode(n);

      if (args.layoutMode === "freeform") {
        const pos = n.pos ?? { x: 0, y: 0 };
        const style =
          `left:${Math.round(pos.x)}px;top:${Math.round(pos.y)}px` +
          (n.zIndex != null ? `;z-index:${n.zIndex}` : "");
        return el("div", { class: "el", style }, inner);
      }

      const display = n.display ?? "block";
      const cls     = display === "inline" ? "el el--inline" : "el";
      const style   = args.layoutMode === "grid" ? gridItemStyle(n) : null;
      return el("div", { class: cls, ...(style ? { style } : {}) }, inner);
    });

    const root     = el("div", { class: containerClass }, ...wrapperNodes);
    const topLevel: HtmlNode[] = [comment("Generated by webwriter-website-builder"), root];
    const htmlOut  = topLevel.map((n) => serialize(n, 0)).join("\n");

    const { flex, grid } = { flex: args.flexSettings, grid: args.gridSettings };
    const gridAreas = "";

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
.page *, .page *::before, .page *::after { box-sizing: inherit; }
.page img, .page video { max-width: 100%; height: auto; display: block; }

/* ── Freeform ──────────────────────────────────────────────────────── */
.page--freeform { position: relative; min-height: 600px; }
.page--freeform .el { position: absolute; }

/* ── Flow ──────────────────────────────────────────────────────────── */
.page--flow .el--inline { display: inline-block; }

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

/* ── Containers (nested layouts) ───────────────────────────────────── */
.container { width: 100%; }

/* ── Media placeholder ─────────────────────────────────────────────── */
.media-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.5rem; padding: 1rem; border: 2px dashed #cbd5e1; border-radius: 8px;
  color: #94a3b8; font-size: 0.85rem; min-height: 120px; margin: 0;
}

/* ── Spacer ────────────────────────────────────────────────────────── */
.spacer { display: block; }
`;

    const combined = `<!-- HTML -->\n${htmlOut}\n\n<style>\n${cssOut}\n</style>`;
    return { html: htmlOut, css: cssOut, combined };
  }
}