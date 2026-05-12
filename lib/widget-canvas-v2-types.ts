import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";

/** Target module for persisted layout (MVP: leads fully wired; channel partners same preview shell). */
export type DetailsPageModuleId = "leads" | "channel-partners";

export type CanvasTextTransform = "none" | "uppercase" | "lowercase";

export type FieldLabelStyle = {
  fontSizePx?: number;
  fontFamily?: string;
  textTransform?: CanvasTextTransform;
  backgroundColor?: string;
  color?: string;
};

export type FieldValueStyle = FieldLabelStyle & {
  /** Read-only value alignment */
  align?: "start" | "center" | "end";
};

export type SectionNodeStyle = {
  backgroundColor?: string;
  borderColor?: string;
  borderWidthPx?: number;
  borderRadiusPx?: number;
  paddingPx?: number;
};

export type TextNodeStyle = {
  content?: string;
  fontSizePx?: number;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
};

export type LineNodeStyle = {
  orientation: "horizontal" | "vertical";
  thicknessPx?: number;
  color?: string;
};

export type IconNodeStyle = {
  /** Simple built-in icon key (no Lucide bundle required for MVP). */
  glyph?: "star" | "phone" | "calendar" | "user";
  iconColor?: string;
  backgroundColor?: string;
};

export type WidgetHeaderStyle = {
  backgroundColor?: string;
  color?: string;
};

export type TaskWidgetColumnId = "taskType" | "dueLabel" | "status";

/** Tabular widgets: which columns to show (order = display order). */
export type WidgetColumnConfig = {
  taskColumns?: TaskWidgetColumnId[];
};

export type CanvasGeometry = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

export type PlacedCanvasWidgetNode = CanvasGeometry & {
  type: "widget";
  kind: string;
  title: string;
  /** Optional per-widget column layout (e.g. tasks). */
  columns?: WidgetColumnConfig;
  /** Reserved for saved filters (MVP: unused). */
  filterPresetId?: string | null;
  headerStyle?: WidgetHeaderStyle;
  bodyBackgroundColor?: string;
  rowGapPx?: number;
};

export type PlacedCanvasFieldNode = CanvasGeometry & {
  type: "field";
  fieldId: LeftRailFieldId;
  labelStyle?: FieldLabelStyle;
  valueStyle?: FieldValueStyle;
};

export type PlacedCanvasSectionNode = CanvasGeometry & {
  type: "section";
  label?: string;
  style?: SectionNodeStyle;
};

export type PlacedCanvasTextNode = CanvasGeometry & {
  type: "text";
  textStyle?: TextNodeStyle;
};

export type PlacedCanvasLineNode = CanvasGeometry & {
  type: "line";
  lineStyle?: LineNodeStyle;
};

export type PlacedCanvasIconNode = CanvasGeometry & {
  type: "icon";
  iconStyle?: IconNodeStyle;
};

export type PlacedCanvasNode =
  | PlacedCanvasWidgetNode
  | PlacedCanvasFieldNode
  | PlacedCanvasSectionNode
  | PlacedCanvasTextNode
  | PlacedCanvasLineNode
  | PlacedCanvasIconNode;

/** Alias for widget nodes (matches older “placed widget” naming). */
export type PlacedCanvasWidget = PlacedCanvasWidgetNode;

export type WidgetCanvasTabState = {
  id: string;
  label: string;
  nodes: PlacedCanvasNode[];
};

export type WidgetCanvasV2Document = {
  schema: 3;
  moduleId: DetailsPageModuleId;
  activeTabId: string;
  tabs: WidgetCanvasTabState[];
};
