import type {
  BuilderNode,
  BuilderStatePayload,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "./types";
import { defaultFlexSettings, defaultGridSettings } from "./types";

function migrateNodeGrid(n: any): any {
  // If old schema stored container settings on node.grid, drop them.
  // New schema expects placement fields only.
  const g = n?.grid;
  if (!g || typeof g !== "object") return n;

  const hasOldContainerKeys = "columns" in g || "rows" in g || "gap" in g;

  if (!hasOldContainerKeys) return n;

  // Remove old node.grid (container settings never belonged on node)
  const { grid, ...rest } = n;
  return rest;
}

export type ParsedBuilderState = {
  layoutMode: LayoutMode;
  freeformNodes: BuilderNode[];
  orderedNodes: BuilderNode[];
  nodes?: BuilderNode[];
  showGrid: boolean;
  gridSize: number;
  flexSettings: FlexSettings;
  gridSettings: GridSettings;
  visibleLayoutModes?: Record<LayoutMode, boolean>;
  visibleCodeTabs?: Record<"html" | "css" | "combined", boolean>;
  showComponentSettingsInStudent?: boolean;
  showSidebarInStudent?: boolean;
  allowDeleteInStudent?: boolean;
};

export function serializeBuilderState(args: {
  layoutMode: LayoutMode;
  freeformNodes: BuilderNode[];
  orderedNodes: BuilderNode[];
  showGrid: boolean;
  gridSize: number;
  flexSettings: FlexSettings;
  gridSettings: GridSettings;
  visibleLayoutModes: Record<LayoutMode, boolean>;
  visibleCodeTabs: Record<"html" | "css" | "combined", boolean>;
  showComponentSettingsInStudent: boolean;
  showSidebarInStudent: boolean;
  allowDeleteInStudent: boolean;
}): string {
  const payload: any = {
    layoutMode: args.layoutMode,
    freeformNodes: args.freeformNodes,
    orderedNodes: args.orderedNodes,

    showGrid: args.showGrid,
    gridSize: args.gridSize,
    flexSettings: args.flexSettings,
    gridSettings: args.gridSettings,
    visibleLayoutModes: args.visibleLayoutModes,
    visibleCodeTabs: args.visibleCodeTabs,
    showComponentSettingsInStudent: args.showComponentSettingsInStudent,
    showSidebarInStudent: args.showSidebarInStudent,
    allowDeleteInStudent: args.allowDeleteInStudent,
  };

  return JSON.stringify(payload);
}

export function parseBuilderState(
  serialized: string,
): ParsedBuilderState | null {
  if (!serialized) return null;

  try {
    const parsed = JSON.parse(serialized);

    const layoutMode =
      (parsed.layoutMode as LayoutMode | undefined) ?? "freeform";

    const freeformNodesRaw = Array.isArray(parsed.freeformNodes)
      ? (parsed.freeformNodes as BuilderNode[])
      : [];

    const orderedNodesRaw = Array.isArray(parsed.orderedNodes)
      ? (parsed.orderedNodes as BuilderNode[])
      : Array.isArray(parsed.nodes)
        ? (parsed.nodes as BuilderNode[])
        : [];

    const freeformNodes = freeformNodesRaw.map(migrateNodeGrid);
    const orderedNodes = orderedNodesRaw.map(migrateNodeGrid);

    const flexBase = defaultFlexSettings();
    const gridBase = defaultGridSettings();

    const flexSettings =
      parsed.flexSettings && typeof parsed.flexSettings === "object"
        ? { ...flexBase, ...parsed.flexSettings }
        : flexBase;

    const gridSettings =
      parsed.gridSettings && typeof parsed.gridSettings === "object"
        ? { ...gridBase, ...parsed.gridSettings }
        : gridBase;

    const visibleLayoutModes =
      parsed.visibleLayoutModes && typeof parsed.visibleLayoutModes === "object"
        ? (parsed.visibleLayoutModes as Record<LayoutMode, boolean>)
        : undefined;

    const visibleCodeTabs =
      parsed.visibleCodeTabs && typeof parsed.visibleCodeTabs === "object"
        ? (parsed.visibleCodeTabs as Record<
            "html" | "css" | "combined",
            boolean
          >)
        : undefined;

    const showComponentSettingsInStudent =
      parsed.showComponentSettingsInStudent == null
        ? undefined
        : Boolean(parsed.showComponentSettingsInStudent);

    const showSidebarInStudent =
      parsed.showSidebarInStudent == null
        ? undefined
        : Boolean(parsed.showSidebarInStudent);

    const allowDeleteInStudent =
      parsed.allowDeleteInStudent == null
        ? undefined
        : Boolean(parsed.allowDeleteInStudent);

    return {
      layoutMode,
      freeformNodes,
      orderedNodes,
      nodes: Array.isArray(parsed.nodes)
        ? (parsed.nodes as BuilderNode[])
        : undefined,
      showGrid: Boolean(parsed.showGrid),
      gridSize: Number(parsed.gridSize ?? 20),
      flexSettings,
      gridSettings,
      visibleLayoutModes,
      visibleCodeTabs,
      showComponentSettingsInStudent,
      showSidebarInStudent,
      allowDeleteInStudent,
    };
  } catch {
    return null;
  }
}
