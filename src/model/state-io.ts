import type {
  BuilderNode,
  BuilderStatePayload,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "./types";
import { defaultFlexSettings, defaultGridSettings } from "./types";

function migrateNodeGrid(n: BuilderNode): BuilderNode {
  const g = n?.grid;
  if (!g || typeof g !== "object") return migrateNodeChildren(n);

  const hasOldContainerKeys = "columns" in g || "rows" in g || "gap" in g;

  const migrated = hasOldContainerKeys
    ? (() => {
        const { grid, ...rest } = n;
        return rest;
      })()
    : n;

  return migrateNodeChildren(migrated);
}

function migrateNodeChildren(n: BuilderNode): BuilderNode {
  if (!Array.isArray(n?.children) || n.children.length === 0) return n;
  return { ...n, children: n.children.map(migrateNodeGrid) };
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
  canvasBackground: string;
  visibleLayoutModes?: Record<LayoutMode, boolean>;
  visibleCodeTabs?: Record<"html" | "css" | "combined", boolean>;
  showComponentSettingsInStudent?: boolean;
  showSidebarInStudent?: boolean;
  allowDeleteInStudent?: boolean;
  showToolbarInStudent?: boolean;
  showAddButton?: boolean;
  showLayoutDropdown?: boolean;
};

export type BuilderStateFields = {
  layoutMode: LayoutMode;
  freeformNodes: BuilderNode[];
  orderedNodes: BuilderNode[];
  showGrid: boolean;
  gridSize: number;
  flexSettings: FlexSettings;
  gridSettings: GridSettings;
  canvasBackground: string;
  visibleLayoutModes: Record<LayoutMode, boolean>;
  visibleCodeTabs: Record<"html" | "css" | "combined", boolean>;
  showComponentSettingsInStudent: boolean;
  showSidebarInStudent: boolean;
  allowDeleteInStudent: boolean;
  showToolbarInStudent: boolean;
  showAddButton: boolean;
  showLayoutDropdown: boolean;
};

export function serializeBuilderState(args: BuilderStateFields): string {
  const payload: Record<string, unknown> = {
    layoutMode: args.layoutMode,
    freeformNodes: args.freeformNodes,
    orderedNodes: args.orderedNodes,
    showGrid: args.showGrid,
    gridSize: args.gridSize,
    flexSettings: args.flexSettings,
    gridSettings: args.gridSettings,
    canvasBackground: args.canvasBackground,
    visibleLayoutModes: args.visibleLayoutModes,
    visibleCodeTabs: args.visibleCodeTabs,
    showComponentSettingsInStudent: args.showComponentSettingsInStudent,
    showSidebarInStudent: args.showSidebarInStudent,
    allowDeleteInStudent: args.allowDeleteInStudent,
    showToolbarInStudent: args.showToolbarInStudent,
    showAddButton: args.showAddButton,
    showLayoutDropdown: args.showLayoutDropdown,
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

    // ── canvasBackground ────────────────────────────────────────────────────
    const canvasBackground =
      typeof parsed.canvasBackground === "string" && parsed.canvasBackground
        ? parsed.canvasBackground
        : "#ffffff";

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

    const showToolbarInStudent =
      parsed.showToolbarInStudent == null
        ? undefined
        : Boolean(parsed.showToolbarInStudent);

    const showAddButton =
      parsed.showAddButton == null ? undefined : Boolean(parsed.showAddButton);

    const showLayoutDropdown =
      parsed.showLayoutDropdown == null
        ? undefined
        : Boolean(parsed.showLayoutDropdown);

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
      canvasBackground,
      visibleLayoutModes,
      visibleCodeTabs,
      showComponentSettingsInStudent,
      showSidebarInStudent,
      allowDeleteInStudent,
      showAddButton,
      showLayoutDropdown,
      showToolbarInStudent,
    };
  } catch {
    return null;
  }
}
/** The fields of a parsed state; what the document did not store keeps its current value. */
export function mergeParsedState(
  parsed: ParsedBuilderState,
  current: BuilderStateFields,
): BuilderStateFields {
  return {
    layoutMode: parsed.layoutMode,
    visibleLayoutModes: parsed.visibleLayoutModes ?? current.visibleLayoutModes,
    visibleCodeTabs: parsed.visibleCodeTabs ?? current.visibleCodeTabs,
    showComponentSettingsInStudent:
      parsed.showComponentSettingsInStudent ??
      current.showComponentSettingsInStudent,
    showSidebarInStudent:
      parsed.showSidebarInStudent ?? current.showSidebarInStudent,
    allowDeleteInStudent:
      parsed.allowDeleteInStudent ?? current.allowDeleteInStudent,
    showAddButton: parsed.showAddButton ?? current.showAddButton,
    showLayoutDropdown: parsed.showLayoutDropdown ?? current.showLayoutDropdown,
    showToolbarInStudent:
      parsed.showToolbarInStudent ?? current.showToolbarInStudent,
    freeformNodes: parsed.freeformNodes ?? [],
    orderedNodes: parsed.orderedNodes ?? parsed.nodes ?? [],
    showGrid: parsed.showGrid,
    gridSize: parsed.gridSize,
    flexSettings: parsed.flexSettings,
    gridSettings: parsed.gridSettings,
    canvasBackground: parsed.canvasBackground ?? "#ffffff",
  };
}
