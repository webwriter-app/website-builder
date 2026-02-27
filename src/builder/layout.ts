import type { BuilderNode } from "./types";

export function sortedNodes(nodes: BuilderNode[]): BuilderNode[] {
  return [...nodes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function normalizeOrder(nodes: BuilderNode[]): BuilderNode[] {
  return nodes.map((n, i) => ({ ...n, order: i }));
}

export function convertFreeformToOrdered(nodes: BuilderNode[]): BuilderNode[] {
  const withPos = nodes.map((n) => ({
    ...n,
    pos: n.pos ?? { x: 0, y: 0 },
    display: n.display ?? "block",
  }));

  withPos.sort((a, b) => a.pos!.y - b.pos!.y || a.pos!.x - b.pos!.x);

  return withPos.map((n, i) => ({ ...n, order: i }));
}

export function convertOrderedToFreeform(nodes: BuilderNode[]): BuilderNode[] {
  const sorted = sortedNodes(nodes);
  let y = 32;
  const x = 32;

  return sorted.map((n) => {
    const pos = n.pos ?? { x, y };
    y += 80;
    const { grid, ...rest } = n as any;
    return { ...rest, pos };
  });
}
