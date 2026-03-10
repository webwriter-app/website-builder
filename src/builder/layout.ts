import type {
  BuilderNode,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "./types";
import { defaultFlexSettings, defaultGridSettings } from "./types";

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

// ── Recursive tree helpers ────────────────────────────────────────────────────

/**
 * Walk all nodes in the tree (root-level + all nested children), depth-first.
 */
export function walkNodes(
  nodes: BuilderNode[],
  visitor: (node: BuilderNode, parent: BuilderNode | null) => void,
  parent: BuilderNode | null = null,
): void {
  for (const node of nodes) {
    visitor(node, parent);
    if (node.children?.length) {
      walkNodes(node.children, visitor, node);
    }
  }
}

/**
 * Find a node anywhere in the tree by id. Returns the node or null.
 */
export function findNodeById(
  nodes: BuilderNode[],
  id: string,
): BuilderNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Update a node anywhere in the tree by id (immutable).
 */
export function updateNodeById(
  nodes: BuilderNode[],
  id: string,
  patch: Partial<BuilderNode>,
): BuilderNode[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, ...patch };
    if (node.children?.length) {
      return { ...node, children: updateNodeById(node.children, id, patch) };
    }
    return node;
  });
}

/**
 * Delete a node anywhere in the tree by id (immutable).
 */
export function deleteNodeById(
  nodes: BuilderNode[],
  id: string,
): BuilderNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => {
      if (node.children?.length) {
        return { ...node, children: deleteNodeById(node.children, id) };
      }
      return node;
    });
}

// ── Grouping ──────────────────────────────────────────────────────────────────

/**
 * Wrap the nodes identified by `ids` into a new container node.
 * The container is inserted at the position of the first selected node.
 * Returns the updated node list and the new container's id.
 *
 * Only works on root-level nodes (nesting containers inside containers
 * is intentionally handled by operating on the right children array upstream).
 */
export function groupNodes(
  nodes: BuilderNode[],
  ids: string[],
  opts: {
    containerLayout?: LayoutMode;
    containerFlexSettings?: FlexSettings;
    containerGridSettings?: GridSettings;
  } = {},
): { nodes: BuilderNode[]; containerId: string } {
  if (ids.length < 2) {
    const fallbackId = ids[0] ?? "";
    return { nodes, containerId: fallbackId };
  }

  const idSet = new Set(ids);
  const sorted = sortedNodes(nodes);

  // Collect selected nodes (preserving their existing order)
  const selected = sorted.filter((n) => idSet.has(n.id));
  const remaining = sorted.filter((n) => !idSet.has(n.id));

  // Insert position = index of first selected node in the original sorted list
  const insertIndex = sorted.findIndex((n) => idSet.has(n.id));

  const containerId = crypto.randomUUID();
  const container: BuilderNode = {
    id: containerId,
    type: "container",
    data: {},
    isContainer: true,
    containerLayout: opts.containerLayout ?? "flex",
    containerFlexSettings: opts.containerFlexSettings ?? defaultFlexSettings(),
    containerGridSettings: opts.containerGridSettings ?? defaultGridSettings(),
    children: normalizeOrder(selected.map((n) => ({ ...n }))),
    order: insertIndex,
    display: "block",
  };

  // Rebuild list with container in place
  const result = [...remaining];
  result.splice(insertIndex, 0, container);

  return { nodes: normalizeOrder(result), containerId };
}

/**
 * Dissolve a container node back into its children at the root level.
 * Children inherit their order relative to where the container was.
 */
export function ungroupNodes(
  nodes: BuilderNode[],
  containerId: string,
): BuilderNode[] {
  const sorted = sortedNodes(nodes);
  const containerIndex = sorted.findIndex((n) => n.id === containerId);
  if (containerIndex < 0) return nodes;

  const container = sorted[containerIndex];
  const children = sortedNodes(container.children ?? []);

  const result = [
    ...sorted.slice(0, containerIndex),
    ...children,
    ...sorted.slice(containerIndex + 1),
  ];

  return normalizeOrder(result);
}
