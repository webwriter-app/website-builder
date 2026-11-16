import type { WebwriterWebsiteBuilder } from "../../widgets/webwriter-website-builder";
import type { BuilderNode } from "../../model/types";
import { ComponentRegistry } from "../registry";

/** Adds a node of the given type to the canvas and selects it. */
export function quickAdd(host: WebwriterWebsiteBuilder, type: string) {
  const component = ComponentRegistry[type];
  if (!component) return;

  const freeform = host.layoutMode === "freeform";
  const node: BuilderNode = {
    id: crypto.randomUUID(),
    type,
    data: structuredClone(component.defaultData ?? {}),
    ...(freeform ? { pos: { x: 32, y: 32 } } : {}),
    order: host.activeNodes.length,
    display: "block",
  };
  host.setActiveNodes([...host.activeNodes, node]);
  if (!freeform) host.normalizeOrder();
  host.selectNodeId(node.id);
}
