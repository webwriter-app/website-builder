import { html } from "lit";
import type { WebwriterWebsiteBuilder } from "../../widgets/webwriter-website-builder";
import { ComponentRegistry } from "../registry";
import { tileGlyph } from "./palette-helpers";
import iconArrowBackUp from "@tabler/icons/outline/arrow-back-up.svg";

// ─── Layers Panel + Background Color ─────────────────────────────────────────
// The background color picker is always shown; the layers list only in freeform + author mode.

export function renderLayersPanel(host: WebwriterWebsiteBuilder) {
  const bg = host.canvasBackground ?? "#ffffff";

  // Background color presets
  const presets = [
    { label: host.msg("White"),     value: "#ffffff" },
    { label: host.msg("Off-white"), value: "#f8fafc" },
    { label: host.msg("Light grey"),value: "#f1f5f9" },
    { label: host.msg("Dark"),      value: "#0f172a" },
    { label: host.msg("Midnight"),  value: "#1e293b" },
    { label: host.msg("Charcoal"),  value: "#18181b" },
  ];

  const bgSection = html`
    <div style="margin-bottom: 0.75rem;">
      <div style="font-size:0.8rem;color:var(--sl-color-neutral-600);margin-bottom:0.4rem;font-weight:600;">
        ${host.msg("Background color")}
      </div>

      <!-- Color input row: swatch + hex input + reset -->
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;">
        <!-- Native color picker -->
        <input
          type="color"
          .value=${bg}
          @input=${(e: Event) => {
            host.canvasBackground = (e.target as HTMLInputElement).value;
            host.requestUpdate();
          }}
          style="
            width: 32px; height: 32px;
            border: 1px solid var(--sl-color-neutral-300);
            border-radius: 6px;
            padding: 2px;
            cursor: pointer;
            background: none;
            flex-shrink: 0;
          "
        />

        <!-- Hex text input -->
        <sl-input
          size="small"
          placeholder="#ffffff"
          .value=${bg}
          @sl-input=${(e: ControlEvent) => {
            const val = String(e.target.value ?? "").trim();
            if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)) {
              host.canvasBackground = val;
              host.requestUpdate();
            }
          }}
          style="flex:1;min-width:50px;"
        ></sl-input>

        <!-- Reset to white -->
        <sl-button
          size="small"
          variant="default"
          title=${host.msg("Reset to white")}
          @click=${() => {
            host.canvasBackground = "#ffffff";
            host.requestUpdate();
          }}
        >
          <sl-icon src=${iconArrowBackUp}></sl-icon>
        </sl-button>
      </div>

      <!-- Preset swatches -->
      <div style="display:flex;gap:5px;flex-wrap:wrap;">
        ${presets.map(
          (p) => html`
            <button
              type="button"
              title=${p.label}
              aria-label=${p.label}
              @click=${() => {
                host.canvasBackground = p.value;
                host.requestUpdate();
              }}
              style="
                width: 22px; height: 22px;
                border-radius: 4px;
                border: 2px solid ${bg === p.value
                  ? "var(--sl-color-primary-600)"
                  : "var(--sl-color-neutral-300)"};
                background: ${p.value};
                cursor: pointer;
                padding: 0;
                flex-shrink: 0;
                box-shadow: ${bg === p.value ? "0 0 0 1px var(--sl-color-primary-300)" : "none"};
              "
            ></button>
          `,
        )}
      </div>
    </div>
  `;

  // Layers list: only in freeform + author mode
  if (host.layoutMode !== "freeform" || !host.isAuthorMode()) {
    return bgSection;
  }

  const nodes = [...host.freeformNodes].sort(
    (a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0),
  );

  return html`
    ${bgSection}

    <sl-details summary=${host.msg("Layers")} style="margin-top:0.25rem;">
      <div style="font-size:0.78rem;color:var(--sl-color-neutral-600);margin-bottom:0.5rem;">
        ${host.msg("Higher = in front. Click to select.")}
      </div>
      ${nodes.map((n) => {
        const comp = n.isContainer ? null : ComponentRegistry[n.type];
        const label = comp?.label?.(host.msg) ?? n.type;
        const selected = host.selectedNodeId === n.id;
        const zIdx = n.zIndex ?? 0;

        return html`
          <div
            class="layer-row ${selected ? "layer-row--selected" : ""}"
            role="button"
            tabindex="0"
            aria-pressed=${selected ? "true" : "false"}
            @click=${() => host.selectNodeId(n.id)}
            @keydown=${(e: KeyboardEvent) => {
              if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
              e.preventDefault();
              host.selectNodeId(n.id);
            }}
          >
            <span class="layer-glyph">${tileGlyph(n.type)}</span>
            <span class="layer-label">${label}</span>
            <div class="layer-z-controls">
              <button class="layer-z-btn" type="button" title=${host.msg("Bring forward")} aria-label=${host.msg("Bring forward")}
                @click=${(e: MouseEvent) => { e.stopPropagation(); host.updateNode(n.id, { zIndex: zIdx + 1 }); }}>▲</button>
              <span class="layer-z-val">${zIdx}</span>
              <button class="layer-z-btn" type="button" title=${host.msg("Send back")} aria-label=${host.msg("Send back")}
                @click=${(e: MouseEvent) => { e.stopPropagation(); host.updateNode(n.id, { zIndex: Math.max(0, zIdx - 1) }); }}>▼</button>
            </div>
          </div>
        `;
      })}
    </sl-details>
  `;
}
