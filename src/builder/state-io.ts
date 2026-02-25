import type {
  BuilderNode,
  BuilderStatePayload,
  FlexSettings,
  GridSettings,
  LayoutMode,
} from "./types";
import { defaultFlexSettings, defaultGridSettings } from "./types";

export type ParsedBuilderState = {
  layoutMode: LayoutMode;
  freeformNodes: BuilderNode[];
  orderedNodes: BuilderNode[];
  nodes?: BuilderNode[];
  showGrid: boolean;
  gridSize: number;
  flexSettings: FlexSettings;
  gridSettings: GridSettings;
};

export function serializeBuilderState(args: {
  layoutMode: LayoutMode;
  freeformNodes: BuilderNode[];
  orderedNodes: BuilderNode[];
  showGrid: boolean;
  gridSize: number;
  flexSettings: FlexSettings;
  gridSettings: GridSettings;
}): string {
  const payload: any = {
    layoutMode: args.layoutMode,
    freeformNodes: args.freeformNodes,
    orderedNodes: args.orderedNodes,

    showGrid: args.showGrid,
    gridSize: args.gridSize,
    flexSettings: args.flexSettings,
    gridSettings: args.gridSettings,
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

    const freeformNodes = Array.isArray(parsed.freeformNodes)
      ? (parsed.freeformNodes as BuilderNode[])
      : [];

    const orderedNodes = Array.isArray(parsed.orderedNodes)
      ? (parsed.orderedNodes as BuilderNode[])
      : Array.isArray(parsed.nodes)
        ? (parsed.nodes as BuilderNode[])
        : [];

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
    };
  } catch {
    return null;
  }
}
