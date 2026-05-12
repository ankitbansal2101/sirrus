import { LEAD_DETAIL_TABS } from "@/lib/lead-detail-tabs";
import { isLeftRailFieldId } from "@/lib/left-rail-field-registry";
import type {
  DetailsPageModuleId,
  PlacedCanvasNode,
  PlacedCanvasWidgetNode,
  WidgetCanvasTabState,
  WidgetCanvasV2Document,
} from "@/lib/widget-canvas-v2-types";

export const WIDGET_CANVAS_V2_STORAGE_KEY = "sirrus.widget-canvas-v2.v1";

/** Fired after `saveWidgetCanvasV2Document` (same tab). Subscribe for live lead-detail / preview sync. */
export const WIDGET_CANVAS_V2_DOCUMENT_CHANGED = "sirrus:widget-canvas-v2-document-changed";

function presetTabId(label: string, index: number): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `preset-${slug || `tab-${index}`}`;
}

export function defaultWidgetCanvasV2Document(): WidgetCanvasV2Document {
  const tabs: WidgetCanvasTabState[] = LEAD_DETAIL_TABS.map((label, i) => ({
    id: presetTabId(String(label), i),
    label: String(label),
    nodes: [],
  }));
  return { schema: 3, moduleId: "leads", activeTabId: tabs[0].id, tabs };
}

function isDetailsPageModuleId(v: unknown): v is DetailsPageModuleId {
  return v === "leads" || v === "channel-partners";
}

function geomFrom(o: Record<string, unknown>): Pick<PlacedCanvasNode, "id" | "x" | "y" | "w" | "h" | "z"> | null {
  if (typeof o.id !== "string") return null;
  if (typeof o.x !== "number" || typeof o.y !== "number" || typeof o.w !== "number" || typeof o.h !== "number") {
    return null;
  }
  if (typeof o.z !== "number") return null;
  return { id: o.id, x: o.x, y: o.y, w: o.w, h: o.h, z: o.z };
}

function parseTaskColumns(raw: unknown): PlacedCanvasWidgetNode["columns"] {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (!Array.isArray(o.taskColumns)) return undefined;
  const allowed = new Set(["taskType", "dueLabel", "status"]);
  const taskColumns = o.taskColumns.filter((x): x is "taskType" | "dueLabel" | "status" => typeof x === "string" && allowed.has(x));
  return taskColumns.length ? { taskColumns } : undefined;
}

export function parsePlacedCanvasNode(v: unknown): PlacedCanvasNode | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const g = geomFrom(o);
  if (!g) return null;
  const t = o.type;

  if (t === "widget" && typeof o.kind === "string" && typeof o.title === "string") {
    const headerStyle =
      o.headerStyle && typeof o.headerStyle === "object"
        ? (o.headerStyle as Record<string, unknown>)
        : undefined;
    return {
      ...g,
      type: "widget",
      kind: o.kind,
      title: o.title,
      columns: parseTaskColumns(o.columns),
      filterPresetId:
        o.filterPresetId === null ? null : typeof o.filterPresetId === "string" ? o.filterPresetId : undefined,
      headerStyle: headerStyle
        ? {
            backgroundColor: typeof headerStyle.backgroundColor === "string" ? headerStyle.backgroundColor : undefined,
            color: typeof headerStyle.color === "string" ? headerStyle.color : undefined,
          }
        : undefined,
      bodyBackgroundColor: typeof o.bodyBackgroundColor === "string" ? o.bodyBackgroundColor : undefined,
      rowGapPx: typeof o.rowGapPx === "number" ? o.rowGapPx : undefined,
    };
  }

  if (t === "field" && typeof o.fieldId === "string" && isLeftRailFieldId(o.fieldId)) {
    return { ...g, type: "field", fieldId: o.fieldId, labelStyle: o.labelStyle as never, valueStyle: o.valueStyle as never };
  }

  if (t === "section") {
    return { ...g, type: "section", label: typeof o.label === "string" ? o.label : undefined, style: o.style as never };
  }

  if (t === "text") {
    return { ...g, type: "text", textStyle: o.textStyle as never };
  }

  if (t === "line") {
    return { ...g, type: "line", lineStyle: o.lineStyle as never };
  }

  if (t === "icon") {
    return { ...g, type: "icon", iconStyle: o.iconStyle as never };
  }

  return null;
}

/** Legacy widget row (schema 2) — no `type` field. */
function isLegacyPlacedWidget(v: unknown): v is Omit<PlacedCanvasWidgetNode, "type"> {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    o.type === undefined &&
    typeof o.id === "string" &&
    typeof o.kind === "string" &&
    typeof o.title === "string" &&
    typeof o.x === "number" &&
    typeof o.y === "number" &&
    typeof o.w === "number" &&
    typeof o.h === "number" &&
    typeof o.z === "number"
  );
}

function legacyWidgetToNode(w: Omit<PlacedCanvasWidgetNode, "type">): PlacedCanvasWidgetNode {
  return { type: "widget", ...w };
}

function parseTabState(v: unknown): WidgetCanvasTabState | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.label !== "string") return null;

  if (Array.isArray(o.nodes)) {
    const nodes = (o.nodes as unknown[]).map(parsePlacedCanvasNode).filter(Boolean) as PlacedCanvasNode[];
    return { id: o.id, label: o.label, nodes };
  }

  if (Array.isArray(o.widgets)) {
    const nodes = (o.widgets as unknown[])
      .filter(isLegacyPlacedWidget)
      .map((w) => legacyWidgetToNode(w as Omit<PlacedCanvasWidgetNode, "type">));
    return { id: o.id, label: o.label, nodes };
  }

  return { id: o.id, label: o.label, nodes: [] };
}

function normalizeDocument(d: WidgetCanvasV2Document): WidgetCanvasV2Document {
  if (!d.tabs.length) return defaultWidgetCanvasV2Document();
  const active = d.tabs.some((t) => t.id === d.activeTabId) ? d.activeTabId : d.tabs[0].id;
  const moduleId: DetailsPageModuleId = isDetailsPageModuleId(d.moduleId) ? d.moduleId : "leads";
  return {
    schema: 3,
    moduleId,
    activeTabId: active,
    tabs: d.tabs.map((t) => ({
      ...t,
      label: t.label === "Activity" ? "Overview" : t.label,
      nodes: (t.nodes ?? []).map(parsePlacedCanvasNode).filter(Boolean) as PlacedCanvasNode[],
    })),
  };
}

function migrateLegacyWidgetArray(widgets: PlacedCanvasWidgetNode[]): WidgetCanvasV2Document {
  const base = defaultWidgetCanvasV2Document();
  const overviewIdx = base.tabs.findIndex((t) => t.label === "Overview" || t.label === "Activity");
  const idx = overviewIdx >= 0 ? overviewIdx : 0;
  const tabs = base.tabs.map((t, i) => (i === idx ? { ...t, nodes: widgets.map((w) => ({ ...w, type: "widget" as const })) } : t));
  return { schema: 3, moduleId: "leads", activeTabId: tabs[idx].id, tabs };
}

function migrateSchema2Doc(o: Record<string, unknown>): WidgetCanvasV2Document | null {
  if (o.schema !== 2 || !Array.isArray(o.tabs)) return null;
  const tabs = (o.tabs as unknown[]).map(parseTabState).filter(Boolean) as WidgetCanvasTabState[];
  if (!tabs.length) return null;
  const activeTabId = typeof o.activeTabId === "string" ? o.activeTabId : tabs[0].id;
  return normalizeDocument({ schema: 3, moduleId: "leads", activeTabId, tabs });
}

export function loadWidgetCanvasV2Document(): WidgetCanvasV2Document {
  if (typeof window === "undefined") return defaultWidgetCanvasV2Document();
  try {
    const raw = window.localStorage.getItem(WIDGET_CANVAS_V2_STORAGE_KEY);
    if (!raw) return defaultWidgetCanvasV2Document();
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      const widgets = parsed.filter(isLegacyPlacedWidget).map((w) => legacyWidgetToNode(w)) as PlacedCanvasWidgetNode[];
      return migrateLegacyWidgetArray(widgets);
    }

    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;

      if (o.schema === 2) {
        const migrated = migrateSchema2Doc(o);
        if (migrated) return migrated;
      }

      if (o.schema === 3 && Array.isArray(o.tabs)) {
        const tabs = (o.tabs as unknown[]).map(parseTabState).filter(Boolean) as WidgetCanvasTabState[];
        if (tabs.length === 0) return defaultWidgetCanvasV2Document();
        const doc: WidgetCanvasV2Document = {
          schema: 3,
          moduleId: isDetailsPageModuleId(o.moduleId) ? o.moduleId : "leads",
          activeTabId: typeof o.activeTabId === "string" ? o.activeTabId : tabs[0].id,
          tabs,
        };
        return normalizeDocument(doc);
      }
    }

    return defaultWidgetCanvasV2Document();
  } catch {
    return defaultWidgetCanvasV2Document();
  }
}

export function saveWidgetCanvasV2Document(doc: WidgetCanvasV2Document) {
  if (typeof window === "undefined") return;
  const normalized = normalizeDocument(doc);
  window.localStorage.setItem(WIDGET_CANVAS_V2_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new CustomEvent(WIDGET_CANVAS_V2_DOCUMENT_CHANGED));
}

/** Nodes for the lead-detail tab that matches `LEAD_DETAIL_TABS[tabIndex]`. */
export function nodesForLeadDetailTabIndex(doc: WidgetCanvasV2Document, tabIndex: number): PlacedCanvasNode[] {
  if (tabIndex < 0 || tabIndex >= LEAD_DETAIL_TABS.length) return [];
  const label = LEAD_DETAIL_TABS[tabIndex];
  const byLabel = doc.tabs.find((t) => t.label === label);
  if (byLabel) return byLabel.nodes;
  return doc.tabs[tabIndex]?.nodes ?? [];
}

/** @deprecated Use {@link nodesForLeadDetailTabIndex} — returns only widget nodes (lossy). */
export function widgetsForLeadDetailTabIndex(doc: WidgetCanvasV2Document, tabIndex: number): PlacedCanvasWidgetNode[] {
  return nodesForLeadDetailTabIndex(doc, tabIndex).filter((n): n is PlacedCanvasWidgetNode => n.type === "widget");
}

/** Legacy: flat widget list (pre multi-tab). Prefer `loadWidgetCanvasV2Document`. */
export function loadWidgetCanvasV2(): PlacedCanvasWidgetNode[] {
  const d = loadWidgetCanvasV2Document();
  const t = d.tabs.find((x) => x.id === d.activeTabId) ?? d.tabs[0];
  return (t?.nodes ?? []).filter((n): n is PlacedCanvasWidgetNode => n.type === "widget");
}

/** Legacy: saves only widget nodes on the active tab; preserves other node types on that tab. */
export function saveWidgetCanvasV2(widgets: PlacedCanvasWidgetNode[]) {
  const d = loadWidgetCanvasV2Document();
  const tid = d.activeTabId;
  const next: WidgetCanvasV2Document = {
    ...d,
    tabs: d.tabs.map((t) => {
      if (t.id !== tid) return t;
      const rest = t.nodes.filter((n) => n.type !== "widget");
      const asNodes: PlacedCanvasNode[] = [...rest, ...widgets.map((w) => ({ ...w, type: "widget" as const }))];
      return { ...t, nodes: asNodes };
    }),
  };
  saveWidgetCanvasV2Document(next);
}
