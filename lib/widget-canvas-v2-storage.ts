import { LEAD_DETAIL_TABS } from "@/lib/lead-detail-tabs";
import type { PlacedCanvasWidget, WidgetCanvasTabState, WidgetCanvasV2Document } from "@/lib/widget-canvas-v2-types";

export const WIDGET_CANVAS_V2_STORAGE_KEY = "sirrus.widget-canvas-v2.v1";

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
    widgets: [],
  }));
  return { schema: 2, activeTabId: tabs[0].id, tabs };
}

function isPlacedWidget(v: unknown): v is PlacedCanvasWidget {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
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

function isTabState(v: unknown): v is WidgetCanvasTabState {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.label !== "string" || !Array.isArray(o.widgets)) return false;
  return (o.widgets as unknown[]).every(isPlacedWidget);
}

function normalizeDocument(d: WidgetCanvasV2Document): WidgetCanvasV2Document {
  if (!d.tabs.length) return defaultWidgetCanvasV2Document();
  const active = d.tabs.some((t) => t.id === d.activeTabId) ? d.activeTabId : d.tabs[0].id;
  return {
    schema: 2,
    activeTabId: active,
    tabs: d.tabs.map((t) => ({
      ...t,
      widgets: t.widgets.filter(isPlacedWidget),
    })),
  };
}

function migrateLegacyWidgetArray(widgets: PlacedCanvasWidget[]): WidgetCanvasV2Document {
  const base = defaultWidgetCanvasV2Document();
  const activityIdx = base.tabs.findIndex((t) => t.label === "Activity");
  const idx = activityIdx >= 0 ? activityIdx : 0;
  const tabs = base.tabs.map((t, i) => (i === idx ? { ...t, widgets } : t));
  return { schema: 2, activeTabId: tabs[idx].id, tabs };
}

export function loadWidgetCanvasV2Document(): WidgetCanvasV2Document {
  if (typeof window === "undefined") return defaultWidgetCanvasV2Document();
  try {
    const raw = window.localStorage.getItem(WIDGET_CANVAS_V2_STORAGE_KEY);
    if (!raw) return defaultWidgetCanvasV2Document();
    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      const widgets = parsed.filter(isPlacedWidget);
      return migrateLegacyWidgetArray(widgets);
    }

    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;
      if (o.schema === 2 && Array.isArray(o.tabs)) {
        const tabs = (o.tabs as unknown[]).filter(isTabState);
        if (tabs.length === 0) return defaultWidgetCanvasV2Document();
        const doc: WidgetCanvasV2Document = {
          schema: 2,
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
}

/** Legacy: flat widget list (pre multi-tab). Prefer `loadWidgetCanvasV2Document`. */
export function loadWidgetCanvasV2(): PlacedCanvasWidget[] {
  const d = loadWidgetCanvasV2Document();
  const t = d.tabs.find((x) => x.id === d.activeTabId) ?? d.tabs[0];
  return t?.widgets ?? [];
}

/** Legacy: saves only the active tab as a flat array — breaks multi-tab. Use `saveWidgetCanvasV2Document`. */
export function saveWidgetCanvasV2(widgets: PlacedCanvasWidget[]) {
  const d = loadWidgetCanvasV2Document();
  const tid = d.activeTabId;
  const next: WidgetCanvasV2Document = {
    ...d,
    tabs: d.tabs.map((t) => (t.id === tid ? { ...t, widgets } : t)),
  };
  saveWidgetCanvasV2Document(next);
}
