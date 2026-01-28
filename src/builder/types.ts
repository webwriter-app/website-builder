export type LayoutMode = "freeform" | "flow" | "flex" | "grid";

export type BuilderNode = {
  id: string;
  type: string;
  data: any;

  // freeform
  pos?: { x: number; y: number };

  // flow/flex/grid ordering & display
  order?: number;
  display?: "block" | "inline";

  // flex/grid (minimal foundation)
  flex?: {
    direction?: "row" | "column";
    justify?: string;
    align?: string;
    gap?: string;
    wrap?: "nowrap" | "wrap";
  };
  grid?: {
    columns?: string;
    rows?: string;
    gap?: string;
  };
};

export type FlexSettings = NonNullable<BuilderNode["flex"]>;
export type GridSettings = NonNullable<BuilderNode["grid"]>;

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
});
