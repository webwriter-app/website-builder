export type LayoutMode = "freeform" | "flow" | "flex" | "grid";

export type BuilderNode = {
  id: string;
  type: string;
  data: any;

  // only needed in freeform
  pos?: { x: number; y: number };

  // flow/flex/grid ordering & display
  order?: number;
  display?: "block" | "inline"; // changable in settings

  // flex/grid settings
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

// settings api
export type FlexSettings = NonNullable<BuilderNode["flex"]>;
export type GridSettings = NonNullable<BuilderNode["grid"]>;

// state of the canvas
export type BuilderStatePayload = {
  layoutMode: LayoutMode;
  nodes: BuilderNode[]; // components displayed
  showGrid: boolean;
  gridSize: number; // in pixels
  flexSettings: FlexSettings;
  gridSettings: GridSettings;
};

// default options for the flex layout
export const defaultFlexSettings = (): FlexSettings => ({
  direction: "row",
  justify: "flex-start",
  align: "stretch",
  gap: "12px",
  wrap: "nowrap",
});

// default settings for the grid layout
export const defaultGridSettings = (): GridSettings => ({
  columns: "repeat(3, 1fr)",
  rows: "auto",
  gap: "12px",
});
