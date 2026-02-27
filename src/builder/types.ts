export type LayoutMode = "freeform" | "flow" | "flex" | "grid";

/** Per-node placement INSIDE a grid container */
export type GridPlacement = {
  /** If set, uses grid-area */
  area?: string;

  /** If area is not set, use explicit line placement */
  colStart?: number; // 1-based
  colSpan?: number; // >= 1
  rowStart?: number; // 1-based
  rowSpan?: number; // >= 1

  justifySelf?: "start" | "center" | "end" | "stretch";
  alignSelf?: "start" | "center" | "end" | "stretch";
};

export type BuilderNode = {
  id: string;
  type: string;
  data: any;

  // only needed in freeform
  pos?: { x: number; y: number };

  // flow/flex/grid ordering & display
  order?: number;
  display?: "block" | "inline";

  flex?: {
    direction?: "row" | "column";
    justify?: string;
    align?: string;
    gap?: string;
    wrap?: "nowrap" | "wrap";
  };

  /** NEW: per-item grid placement */
  grid?: GridPlacement;
};

/** container settings (global) */
export type FlexSettings = {
  direction?: "row" | "column";
  justify?: string;
  align?: string;
  gap?: string;
  wrap?: "nowrap" | "wrap";
};

export type GridSettings = {
  columns?: string;
  rows?: string;
  gap?: string;

  /** optional advanced grid architecture */
  templateAreas?: string; // e.g. `"nav nav"\n"hero side"`
  autoFlow?: "row" | "column" | "row dense" | "column dense";
  justifyItems?: "start" | "center" | "end" | "stretch";
  alignItems?: "start" | "center" | "end" | "stretch";
};

// state of the canvas
export type BuilderStatePayload = {
  layoutMode: LayoutMode;
  nodes: BuilderNode[];
  showGrid: boolean;
  gridSize: number;
  flexSettings: FlexSettings;
  gridSettings: GridSettings;
};

export const defaultFlexSettings = (): FlexSettings => ({
  direction: "row",
  justify: "flex-start",
  align: "stretch",
  gap: "12px",
  wrap: "nowrap",
});

export const defaultGridSettings = (): GridSettings => ({
  columns: "repeat(3, 1fr)",
  rows: "auto",
  gap: "12px",

  templateAreas: "",
  autoFlow: "row",
  justifyItems: "stretch",
  alignItems: "start",
});
