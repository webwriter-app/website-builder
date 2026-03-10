export type LayoutMode = "freeform" | "flow" | "flex" | "grid";

export type GridPlacement = {
  area?: string;
  colStart?: number;
  colSpan?: number;
  rowStart?: number;
  rowSpan?: number;
  justifySelf?: "start" | "center" | "end" | "stretch";
  alignSelf?: "start" | "center" | "end" | "stretch";
};

/** Per-child overrides when the parent container is flex */
export type FlexItemSettings = {
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string;
  alignSelf?: "auto" | "flex-start" | "center" | "flex-end" | "stretch" | "baseline";
};

export type BuilderNode = {
  id: string;
  type: string;
  data: any;

  pos?: { x: number; y: number };
  zIndex?: number;

  order?: number;
  display?: "block" | "inline";

  flexItem?: FlexItemSettings;
  grid?: GridPlacement;

  children?: BuilderNode[];
  isContainer?: boolean;
  containerLayout?: LayoutMode;
  containerFlexSettings?: FlexSettings;
  containerGridSettings?: GridSettings;
  // breakpoints removed
};

export type CodeTab = "html" | "css" | "combined";

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
  autoFlow?: "row" | "column" | "row dense" | "column dense";
  justifyItems?: "start" | "center" | "end" | "stretch";
  alignItems?: "start" | "center" | "end" | "stretch";
};

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
  autoFlow: "row",
  justifyItems: "stretch",
  alignItems: "start",
});

// ── Container templates — only surfaced inside the group toolbar ──────────────

export type ContainerTemplate = {
  id: string;
  label: string;
  description: string;
  containerLayout: LayoutMode;
  containerFlexSettings?: FlexSettings;
  containerGridSettings?: GridSettings;
};

export const CONTAINER_TEMPLATES: ContainerTemplate[] = [
  {
    id: "two-column",
    label: "Two Columns",
    description: "Equal-width side-by-side columns",
    containerLayout: "flex",
    containerFlexSettings: { direction: "row", justify: "flex-start", align: "stretch", gap: "16px", wrap: "wrap" },
  },
  {
    id: "hero-sidebar",
    label: "Hero + Sidebar",
    description: "Wide main area with a narrow sidebar",
    containerLayout: "grid",
    containerGridSettings: { columns: "1fr 280px", rows: "auto", gap: "16px", autoFlow: "row", justifyItems: "stretch", alignItems: "start" },
  },
  {
    id: "card-grid",
    label: "Card Grid",
    description: "Responsive 3-column card layout",
    containerLayout: "grid",
    containerGridSettings: { columns: "repeat(3, 1fr)", rows: "auto", gap: "16px", autoFlow: "row", justifyItems: "stretch", alignItems: "start" },
  },
  {
    id: "centered-stack",
    label: "Centered Stack",
    description: "Vertically stacked, centered items",
    containerLayout: "flex",
    containerFlexSettings: { direction: "column", justify: "flex-start", align: "center", gap: "12px", wrap: "nowrap" },
  },
];