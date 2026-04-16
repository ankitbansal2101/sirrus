/** Palette entries for the widgets canvas configurator (V2). */

export type DeveloperCanvasWidgetKind = string;

export type DeveloperCanvasPaletteItem = {
  id: DeveloperCanvasWidgetKind;
  title: string;
  /** Default size on drop, as fraction of canvas (0–1). */
  defaultW: number;
  defaultH: number;
};

export const DEVELOPER_WIDGET_CANVAS_PALETTE: DeveloperCanvasPaletteItem[] = [
  { id: "pair", title: "PAIR Score", defaultW: 0.42, defaultH: 0.14 },
  { id: "ai-summary", title: "AI Summary", defaultW: 0.55, defaultH: 0.18 },
  { id: "open-tasks", title: "Open Tasks", defaultW: 0.38, defaultH: 0.22 },
  { id: "notes", title: "Notes", defaultW: 0.4, defaultH: 0.24 },
  /** Narrow strip: canvas shows the same left rail as the full lead-detail preview. */
  { id: "lead-details", title: "Lead Details", defaultW: 0.28, defaultH: 0.92 },
  { id: "lead-status-history", title: "Lead status history", defaultW: 0.35, defaultH: 0.28 },
];
