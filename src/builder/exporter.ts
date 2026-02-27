import type {
  BuilderNode,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "./types";
import { sortedNodes } from "./layout";

// code generator
export class BuilderExporter {
  // get rid of ugly artifacts
  private escapeHtml(s: string) {
    return s
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  // helper, makes the attribute name safe to use
  private safeAttr(s: unknown) {
    if (s == null) return "";
    return String(s).replaceAll('"', "&quot;");
  }

  // real code generation
  private nodeToHtml(n: BuilderNode): string {
    const t = n.type; // get type
    const d = n.data ?? {}; // get payload

    // depending on component-type...
    switch (t) {
      case "h1": {
        const text = d.text ?? d.value ?? "Heading";
        return `<h1>${this.escapeHtml(String(text))}</h1>`;
      }
      case "paragraph": {
        const text = d.text ?? d.value ?? "Text…";
        return `<p>${this.escapeHtml(String(text))}</p>`;
      }
      // TODO: make src more approachable, right now its URL64 blob
      case "image": {
        const src = d.src ?? "";
        const alt = d.alt ?? "";
        return `<img src="${this.safeAttr(src)}" alt="${this.escapeHtml(
          String(alt),
        )}">`;
      }
      // TODO: make src more approachable, right now its URL64 blob
      case "video": {
        const src = d.src ?? "";
        return `<video src="${this.safeAttr(src)}" controls></video>`;
      }
      // TODO: make src more approachable, right now its URL64 blob
      case "audio": {
        const src = d.src ?? "";
        return `<audio src="${this.safeAttr(src)}" controls></audio>`;
      }
      case "divider": {
        return `<hr>`;
      }
      // TODO: think about better target and rel
      case "link": {
        const href = d.href ?? "#";
        const label = d.label ?? "Link";
        return `<a href="${this.safeAttr(
          href,
        )}" target="_blank" rel="noopener">${this.escapeHtml(
          String(label),
        )}</a>`;
      }
      case "button": {
        const label = d.label ?? "Button";
        return `<button type="button">${this.escapeHtml(
          String(label),
        )}</button>`;
      }
      // TODO: how to display icons without relying on third party api?
      case "icon": {
        const name = d.name ?? "gear";
        return `<span class="icon" data-icon="${this.safeAttr(name)}"></span>`;
      }
      default:
        return `<!-- unsupported: ${t} -->`; // fallback
    }
  }

  // proper indentation, every new recursive div should be indented 2 spaces more
  private indent(lines: string[], spaces = 2) {
    const pad = " ".repeat(spaces);
    return lines.map((l) => (l ? pad + l : l)).join("\n");
  }

  private gridItemStyle(n: BuilderNode): string {
    const g: any = (n as any).grid ?? {};
    const css: string[] = [];

    const area = String(g.area ?? "").trim();
    if (area) {
      css.push(`grid-area:${area};`);
    } else {
      if (typeof g.colStart === "number") {
        const span = Math.max(1, Number(g.colSpan ?? 1));
        css.push(`grid-column:${g.colStart} / span ${span};`);
      } else if (typeof g.colSpan === "number") {
        css.push(`grid-column: span ${Math.max(1, g.colSpan)};`);
      }

      if (typeof g.rowStart === "number") {
        const span = Math.max(1, Number(g.rowSpan ?? 1));
        css.push(`grid-row:${g.rowStart} / span ${span};`);
      } else if (typeof g.rowSpan === "number") {
        css.push(`grid-row: span ${Math.max(1, g.rowSpan)};`);
      }
    }

    if (g.justifySelf) css.push(`justify-self:${g.justifySelf};`);
    if (g.alignSelf) css.push(`align-self:${g.alignSelf};`);

    return css.join(" ");
  }

  // export code string(s)
  generateExport(args: {
    layoutMode: LayoutMode;
    nodes: BuilderNode[];
    flexSettings: FlexSettings;
    gridSettings: GridSettings;
  }): { html: string; css: string; combined: string } {
    const sorted = sortedNodes(args.nodes); // sort the components

    // decypher current layout mode and print it
    const containerClass =
      args.layoutMode === "freeform"
        ? "page page--freeform"
        : args.layoutMode === "flex"
          ? "page page--flex"
          : args.layoutMode === "grid"
            ? "page page--grid"
            : "page page--flow";

    let bodyHtml = "";

    if (args.layoutMode === "freeform") {
      bodyHtml = sorted
        .map((n) => {
          const pos = n.pos ?? { x: 0, y: 0 }; // append absolute positioning
          return `<div class="el" style="left:${Math.round(
            pos.x,
          )}px; top:${Math.round(pos.y)}px;">${this.nodeToHtml(n)}</div>`;
        })
        .join("\n"); // newline
    } else {
      // if not freeform, we dont need placement values
      bodyHtml = sorted
        .map((n) => {
          const display = n.display ?? "block"; // block as default fallback
          const cls = display === "inline" ? "el el--inline" : "el"; // TODO: do I need such many divs with all having class "el"?
          const style = args.layoutMode === "grid" ? this.gridItemStyle(n) : "";
          const styleAttr = style ? ` style="${this.safeAttr(style)}"` : "";
          return `<div class="${cls}"${styleAttr}>${this.nodeToHtml(n)}</div>`; // wrap everything in divs for clarity
        })
        .join("\n");
    }

    const htmlLines = [
      `<!-- Generated by webwriter-website-builder -->`, // disclaimer
      `<div class="${containerClass}">`, // root div
      this.indent(bodyHtml.split("\n"), 2), // indent the newly generated html body by 2 spaces recursively
      `</div>`,
    ];
    const htmlOut = htmlLines.join("\n");

    const flex = args.flexSettings;
    const grid = args.gridSettings;

    // always the same since its the default styling of the canvas, also appending flex/ grid settings TODO: really needed?
    const cssOut = `/* Generated by webwriter-website-builder */
    .page {
      box-sizing: border-box;
      padding: 16px;
      background: #fff;
      color: #0f172a;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    }

    .page img, .page video {
      max-width: 100%;
      height: auto;
    }

    .page--freeform {
      position: relative;
      min-height: 600px;
    }

    .page--freeform .el {
      position: absolute;
    }

    .page--flow .el--inline {
      display: inline-block;
    }

    .page--flex {
      display: flex;
      flex-direction: ${flex.direction ?? "row"};
      justify-content: ${flex.justify ?? "flex-start"};
      align-items: ${flex.align ?? "stretch"};
      flex-wrap: ${flex.wrap ?? "nowrap"};
      gap: ${flex.gap ?? "12px"};
    }

    .page--grid {
      display: grid;
      grid-template-columns: ${grid.columns ?? "repeat(3, 1fr)"};
      grid-auto-rows: ${grid.rows ?? "auto"};
      gap: ${grid.gap ?? "12px"};
      grid-auto-flow: ${grid.autoFlow ?? "row"};
      justify-items: ${grid.justifyItems ?? "stretch"};
      align-items: ${grid.alignItems ?? "start"};
      ${
        grid.templateAreas && grid.templateAreas.trim()
          ? `grid-template-areas: ${grid.templateAreas};`
          : ""
      }
    }

    /* Icons: placeholder representation */
    .page .icon::before {
      content: attr(data-icon);
      font-size: 12px;
      opacity: 0.7;
      border: 1px solid #e5e7eb;
      padding: 2px 6px;
      border-radius: 999px;
    }
    `;

    // combine generated html and css
    const combined = `<!-- HTML -->
    ${htmlOut}

    <style>
    ${cssOut}
    </style>`;

    return { html: htmlOut, css: cssOut, combined };
  }
}
