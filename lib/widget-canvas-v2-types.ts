export type PlacedCanvasWidget = {
  id: string;
  kind: string;
  title: string;
  /** 0–1 relative to canvas width */
  x: number;
  /** 0–1 relative to canvas height */
  y: number;
  w: number;
  h: number;
  z: number;
};

/** One lead-detail tab (Overview, AI Insights, …) with its own widget canvas. */
export type WidgetCanvasTabState = {
  id: string;
  label: string;
  widgets: PlacedCanvasWidget[];
};

/** Full V2 layout: multiple tabs, each with an independent widget stack (like real lead detail). */
export type WidgetCanvasV2Document = {
  schema: 2;
  activeTabId: string;
  tabs: WidgetCanvasTabState[];
};
