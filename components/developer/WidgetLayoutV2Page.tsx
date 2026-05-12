"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp, FiEdit2, FiPlus, FiX } from "react-icons/fi";
import { MdDeleteOutline, MdSave } from "react-icons/md";
import { CanvasPlacedNode } from "@/components/developer/CanvasPlacedNode";
import { DetailsPageStylePanel } from "@/components/developer/DetailsPageStylePanel";
import { LeadRailFieldConfiguratorPanel } from "@/components/developer/LeadRailFieldConfiguratorPanel";
import { useLeftRailFieldConfigV2 } from "@/components/manage-leads/useLeftRailFieldConfig";
import { DEVELOPER_WIDGET_CANVAS_PALETTE } from "@/lib/developer-widget-canvas-catalog";
import {
  LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT_V2,
  LEFT_RAIL_FIELD_STORAGE_KEY_V2,
} from "@/lib/left-rail-field-config";
import { LEFT_RAIL_FIELD_DEFINITIONS, type LeftRailFieldId } from "@/lib/left-rail-field-registry";
import { isKawalReferenceLead } from "@/lib/lead-detail-fixtures";
import { SAMPLE_LEADS, type LeadRow } from "@/lib/leads-sample-data";
import {
  loadWidgetCanvasV2Document,
  saveWidgetCanvasV2Document,
} from "@/lib/widget-canvas-v2-storage";
import type {
  DetailsPageModuleId,
  PlacedCanvasNode,
  WidgetCanvasV2Document,
} from "@/lib/widget-canvas-v2-types";

const DND_WIDGET = "application/x-sirrus-widget-v2";
const DND_FIELD = "application/x-sirrus-dpb-field";
const DND_ELEMENT = "application/x-sirrus-dpb-element";

const MIN_W = 0.12;
const MIN_H = 0.1;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `n-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pickCanvasSampleLead(): LeadRow {
  const row = SAMPLE_LEADS.find((l) => isKawalReferenceLead(l));
  return row ? { ...row } : { ...SAMPLE_LEADS[0] };
}

type BuilderRailTab = "data" | "elements" | "style";

export function WidgetLayoutV2Page() {
  const [doc, setDoc] = useState<WidgetCanvasV2Document | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewLead, setPreviewLead] = useState<LeadRow>(pickCanvasSampleLead);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { orderedVisibleIds: v2PersistedRailIds } = useLeftRailFieldConfigV2();
  const [canvasLeftRailIds, setCanvasLeftRailIds] = useState<LeftRailFieldId[] | null>(null);
  const leftRailFieldIdsForCanvas = canvasLeftRailIds ?? v2PersistedRailIds;
  const [openPaletteId, setOpenPaletteId] = useState<string | null>(null);
  const [saveAck, setSaveAck] = useState(false);
  const saveAckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [railTab, setRailTab] = useState<BuilderRailTab>("data");

  useEffect(
    () => () => {
      if (saveAckTimer.current) clearTimeout(saveAckTimer.current);
    },
    [],
  );

  const onV2LeftRailVisible = useCallback((ids: LeftRailFieldId[]) => {
    setCanvasLeftRailIds(ids);
  }, []);

  const applyDoc = useCallback((fn: (d: WidgetCanvasV2Document) => WidgetCanvasV2Document) => {
    setDoc((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveWidgetCanvasV2Document(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setDoc(loadWidgetCanvasV2Document());
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const activeTab = doc?.tabs.find((t) => t.id === doc.activeTabId) ?? doc?.tabs[0];
  const nodes = activeTab?.nodes ?? [];

  const selectedNode = useMemo(
    () => (selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null),
    [nodes, selectedId],
  );

  const bringToFront = useCallback(
    (nid: string) => {
      applyDoc((d) => {
        const tid = d.activeTabId;
        const tab = d.tabs.find((t) => t.id === tid);
        if (!tab) return d;
        const z = tab.nodes.length ? Math.max(...tab.nodes.map((n) => n.z)) + 1 : 1;
        const nextNodes = tab.nodes.map((n) => (n.id === nid ? { ...n, z } : n));
        return { ...d, tabs: d.tabs.map((t) => (t.id === tid ? { ...t, nodes: nextNodes } : t)) };
      });
    },
    [applyDoc],
  );

  const patchNode = useCallback(
    (nid: string, patch: Record<string, unknown>) => {
      applyDoc((d) => {
        const tid = d.activeTabId;
        return {
          ...d,
          tabs: d.tabs.map((t) =>
            t.id !== tid
              ? t
              : {
                  ...t,
                  nodes: t.nodes.map((n) => (n.id === nid ? ({ ...n, ...patch } as PlacedCanvasNode) : n)),
                },
          ),
        };
      });
    },
    [applyDoc],
  );

  const placeRect = useCallback((px: number, py: number, w: number, h: number) => {
    const x = clamp(px - w / 2, 0, 1 - w);
    const y = clamp(py - h / 2, 0, 1 - h);
    return { x, y, w: clamp(w, MIN_W, 1), h: clamp(h, MIN_H, 1) };
  }, []);

  const appendNode = useCallback(
    (node: PlacedCanvasNode) => {
      applyDoc((d) => {
        const tid = d.activeTabId;
        const tab = d.tabs.find((t) => t.id === tid);
        if (!tab) return d;
        const z = tab.nodes.length ? Math.max(...tab.nodes.map((n) => n.z)) + 1 : 1;
        const withZ = { ...node, z } as PlacedCanvasNode;
        return { ...d, tabs: d.tabs.map((t) => (t.id === tid ? { ...t, nodes: [...t.nodes, withZ] } : t)) };
      });
      setSelectedId(node.id);
    },
    [applyDoc],
  );

  const onCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rawW = e.dataTransfer.getData(DND_WIDGET);
      if (rawW) {
        let payload: { id: string; title: string; defaultW: number; defaultH: number };
        try {
          payload = JSON.parse(rawW) as typeof payload;
        } catch {
          return;
        }
        const { x, y, w, h } = placeRect(px, py, payload.defaultW, payload.defaultH);
        const id = newId();
        appendNode({
          type: "widget",
          id,
          kind: payload.id,
          title: payload.title,
          x,
          y,
          w,
          h,
          z: 0,
        });
        return;
      }

      const rawF = e.dataTransfer.getData(DND_FIELD);
      if (rawF) {
        let fieldId: LeftRailFieldId;
        try {
          fieldId = JSON.parse(rawF).fieldId as LeftRailFieldId;
        } catch {
          return;
        }
        const { x, y, w, h } = placeRect(px, py, 0.22, 0.055);
        appendNode({ type: "field", id: newId(), fieldId, x, y, w, h, z: 0 });
        return;
      }

      const rawE = e.dataTransfer.getData(DND_ELEMENT);
      if (rawE) {
        let el: { element: "section" | "text" | "line" | "icon" };
        try {
          el = JSON.parse(rawE) as typeof el;
        } catch {
          return;
        }
        const id = newId();
        if (el.element === "section") {
          const { x, y, w, h } = placeRect(px, py, 0.38, 0.16);
          appendNode({ type: "section", id, x, y, w, h, z: 0, label: "Section" });
        } else if (el.element === "text") {
          const { x, y, w, h } = placeRect(px, py, 0.28, 0.065);
          appendNode({
            type: "text",
            id,
            x,
            y,
            w,
            h,
            z: 0,
            textStyle: { content: "Text block", fontSizePx: 13, color: "#334155" },
          });
        } else if (el.element === "line") {
          const { x, y, w, h } = placeRect(px, py, 0.32, 0.028);
          appendNode({
            type: "line",
            id,
            x,
            y,
            w,
            h,
            z: 0,
            lineStyle: { orientation: "horizontal", thicknessPx: 1, color: "#cbd5e1" },
          });
        } else {
          const { x, y, w, h } = placeRect(px, py, 0.055, 0.065);
          appendNode({
            type: "icon",
            id,
            x,
            y,
            w,
            h,
            z: 0,
            iconStyle: { glyph: "star", iconColor: "#34369C" },
          });
        }
      }
    },
    [appendNode, placeRect],
  );

  const clearCanvas = useCallback(() => {
    applyDoc((d) => ({
      ...d,
      tabs: d.tabs.map((t) => (t.id === d.activeTabId ? { ...t, nodes: [] } : t)),
    }));
    setSelectedId(null);
  }, [applyDoc]);

  const selectTab = useCallback(
    (tabId: string) => {
      applyDoc((d) => {
        if (!d.tabs.some((t) => t.id === tabId)) return d;
        return { ...d, activeTabId: tabId };
      });
      setSelectedId(null);
    },
    [applyDoc],
  );

  const addCustomTab = useCallback(() => {
    const label = window.prompt("New tab name", "New tab")?.trim();
    if (!label) return;
    const tabId = `custom-${newId()}`;
    applyDoc((d) => ({
      ...d,
      tabs: [...d.tabs, { id: tabId, label, nodes: [] }],
      activeTabId: tabId,
    }));
    setSelectedId(null);
  }, [applyDoc]);

  const removeNode = useCallback(
    (nodeId: string) => {
      applyDoc((d) => {
        const tid = d.activeTabId;
        return {
          ...d,
          tabs: d.tabs.map((t) => (t.id !== tid ? t : { ...t, nodes: t.nodes.filter((q) => q.id !== nodeId) })),
        };
      });
      setSelectedId((cur) => (cur === nodeId ? null : cur));
    },
    [applyDoc],
  );

  const removeTab = useCallback(
    (tabId: string) => {
      if (!tabId.startsWith("custom-")) return;
      applyDoc((d) => {
        if (d.tabs.length <= 1) return d;
        const tabs = d.tabs.filter((t) => t.id !== tabId);
        const activeTabId = d.activeTabId === tabId ? tabs[0].id : d.activeTabId;
        return { ...d, tabs, activeTabId };
      });
      setSelectedId(null);
    },
    [applyDoc],
  );

  const renameTab = useCallback(
    (tabId: string, currentLabel: string) => {
      const next = window.prompt("Tab name", currentLabel)?.trim();
      if (!next || next === currentLabel) return;
      applyDoc((d) => ({
        ...d,
        tabs: d.tabs.map((t) => (t.id === tabId ? { ...t, label: next } : t)),
      }));
    },
    [applyDoc],
  );

  const setModuleId = useCallback(
    (moduleId: DetailsPageModuleId) => {
      applyDoc((d) => ({ ...d, moduleId }));
    },
    [applyDoc],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId || !doc) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        removeNode(selectedId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, doc, removeNode]);

  const railTabBtn = (id: BuilderRailTab, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setRailTab(id)}
      className={`rounded-lg px-2 py-1 font-outfit text-[10px] font-semibold ${
        railTab === id ? "bg-[#34369C] text-white" : "bg-white/80 text-[#5c5878] hover:bg-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-[min(100%,1920px)] flex-col gap-2 pb-4 pt-0">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-outfit text-base font-semibold tracking-tight text-[#1F1750]">Details Page Builder</h1>
          <p className="max-w-xl font-outfit text-[10px] leading-snug text-[#8b87a8]">
            Canvas layout for module details (widgets, fields, sections). Saves to the same store as lead-detail preview
            sync.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="flex items-center gap-1 font-outfit text-[10px] font-semibold text-[#5c5878]">
            Module
            <select
              value={doc?.moduleId ?? "leads"}
              onChange={(e) => setModuleId(e.target.value as DetailsPageModuleId)}
              className="rounded-md border border-slate-200/90 bg-white px-1.5 py-1 text-[11px] text-[#1F1750]"
            >
              <option value="leads">Leads</option>
              <option value="channel-partners">Channel partners</option>
            </select>
          </label>
          {doc?.moduleId === "channel-partners" ? (
            <span className="font-outfit text-[9px] text-amber-800">Preview uses sample lead shell until CP data ships.</span>
          ) : null}
          <Link
            href="/developer/lead-detail"
            className="rounded-md px-2 py-1 font-outfit text-[10px] font-semibold text-[#34369C] hover:bg-[#34369C]/10"
          >
            Lead detail
          </Link>
          <Link
            href="/settings/details-page-builder"
            className="rounded-md px-2 py-1 font-outfit text-[10px] font-semibold text-[#34369C] hover:bg-[#34369C]/10"
          >
            Settings URL
          </Link>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                if (!doc) return;
                saveWidgetCanvasV2Document(doc);
                if (saveAckTimer.current) clearTimeout(saveAckTimer.current);
                setSaveAck(true);
                saveAckTimer.current = setTimeout(() => {
                  setSaveAck(false);
                  saveAckTimer.current = null;
                }, 2600);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-[#34369C] px-2.5 py-1.5 font-outfit text-[11px] font-semibold text-white shadow-sm hover:opacity-95"
            >
              <MdSave size={15} aria-hidden />
              Save
            </button>
            {saveAck ? (
              <span
                role="status"
                className="inline-flex items-center rounded-lg border border-emerald-200/90 bg-emerald-50 px-2 py-1 font-outfit text-[11px] font-semibold text-emerald-800"
              >
                Saved — preview updated
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={clearCanvas}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-outfit text-[11px] font-semibold text-[#5c5878] hover:bg-slate-50"
          >
            <MdDeleteOutline size={15} aria-hidden />
            Clear tab
          </button>
        </div>
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-2 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-3">
        <aside className="flex max-h-[min(48vh,380px)] min-h-0 shrink-0 flex-col rounded-xl border border-[#34369C]/20 bg-gradient-to-br from-[#f4f5ff] to-white p-2 shadow-sm lg:max-h-none lg:justify-self-stretch">
          <div className="mb-2 flex shrink-0 flex-wrap gap-1">
            {railTabBtn("data", "Data")}
            {railTabBtn("elements", "Elements")}
            {railTabBtn("style", "Style")}
          </div>

          {railTab === "style" ? (
            <DetailsPageStylePanel node={selectedNode} onPatch={(patch) => selectedId && patchNode(selectedId, patch)} />
          ) : railTab === "elements" ? (
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]" role="list">
              {(
                [
                  { element: "section" as const, title: "Section" },
                  { element: "text" as const, title: "Text" },
                  { element: "line" as const, title: "Line" },
                  { element: "icon" as const, title: "Icon" },
                ] as const
              ).map((row) => (
                <li key={row.element}>
                  <div
                    draggable
                    role="button"
                    tabIndex={0}
                    onDragStart={(e) => {
                      e.dataTransfer.setData(DND_ELEMENT, JSON.stringify({ element: row.element }));
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    className="cursor-grab rounded-lg border border-slate-200/90 bg-white px-2 py-1.5 font-outfit text-[11px] font-semibold text-[#1F1750] shadow-sm active:cursor-grabbing"
                  >
                    {row.title}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
              <div>
                <h3 className="font-outfit text-[9px] font-semibold uppercase tracking-wide text-[#6b6578]">Fields</h3>
                <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                  {LEFT_RAIL_FIELD_DEFINITIONS.map((def) => (
                    <li key={def.id}>
                      <div
                        draggable
                        role="button"
                        tabIndex={0}
                        onDragStart={(e) => {
                          e.dataTransfer.setData(DND_FIELD, JSON.stringify({ fieldId: def.id }));
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        className="cursor-grab rounded-md border border-slate-200/80 bg-white px-1.5 py-1 font-outfit text-[10px] font-semibold text-[#1F1750] active:cursor-grabbing"
                      >
                        {def.label}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="min-h-0 flex-1">
                <h3 className="font-outfit text-[9px] font-semibold uppercase tracking-wide text-[#6b6578]">Widgets</h3>
                <ul className="mt-1 min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]" role="list">
                  {DEVELOPER_WIDGET_CANVAS_PALETTE.map((item) => {
                    const dndPayload = JSON.stringify({
                      id: item.id,
                      title: item.title,
                      defaultW: item.defaultW,
                      defaultH: item.defaultH,
                    });
                    const chipClass =
                      "cursor-grab rounded-lg border border-slate-200/90 bg-white px-2 py-1.5 font-outfit text-[11px] font-semibold text-[#1F1750] shadow-sm active:cursor-grabbing min-w-0 flex-1";

                    if (item.id !== "lead-details") {
                      return (
                        <li key={item.id}>
                          <div
                            draggable
                            role="button"
                            tabIndex={0}
                            onDragStart={(e) => {
                              e.dataTransfer.setData(DND_WIDGET, dndPayload);
                              e.dataTransfer.effectAllowed = "copy";
                            }}
                            className={chipClass}
                          >
                            {item.title}
                          </div>
                        </li>
                      );
                    }

                    const rowTitleId = `palette-v2-${item.id}`;
                    const isOpen = openPaletteId === item.id;
                    return (
                      <li
                        key={item.id}
                        className={`overflow-hidden rounded-lg border shadow-[0_1px_0_rgba(15,23,42,0.04)] ${
                          isOpen ? "border-[#34369C]/35 bg-white" : "border-slate-200/90 bg-[#f8f9fc]"
                        }`}
                      >
                        <div className="flex items-stretch gap-0.5">
                          <div
                            draggable
                            role="button"
                            tabIndex={0}
                            onDragStart={(e) => {
                              e.dataTransfer.setData(DND_WIDGET, dndPayload);
                              e.dataTransfer.effectAllowed = "copy";
                            }}
                            className={chipClass}
                          >
                            {item.title}
                          </div>
                          <button
                            type="button"
                            id={rowTitleId}
                            aria-expanded={isOpen}
                            aria-controls={`palette-panel-${item.id}`}
                            title="Configure left rail"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPaletteId((cur) => (cur === item.id ? null : item.id));
                            }}
                            className="inline-flex w-7 shrink-0 flex-col items-center justify-center rounded-md border border-transparent text-[#34369C] hover:bg-white/90"
                          >
                            <span className="sr-only">Configure</span>
                            {isOpen ? <FiChevronUp size={14} aria-hidden /> : <FiChevronDown size={14} aria-hidden />}
                          </button>
                        </div>
                        {isOpen ? (
                          <div
                            id={`palette-panel-${item.id}`}
                            role="region"
                            aria-labelledby={rowTitleId}
                            className="border-t border-slate-200/80 bg-white px-1.5 pb-2 pt-1.5"
                          >
                            <LeadRailFieldConfiguratorPanel
                              storageKey={LEFT_RAIL_FIELD_STORAGE_KEY_V2}
                              changeEvent={LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT_V2}
                              onVisibleIdsChange={onV2LeftRailVisible}
                            />
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5">
          {doc ? (
            <div
              className="flex shrink-0 flex-wrap items-center gap-1 border-b border-slate-200/80 pb-1.5"
              role="tablist"
              aria-label="Detail tabs"
            >
              {doc.tabs.map((t) => {
                const active = doc.activeTabId === t.id;
                const removable = t.id.startsWith("custom-") && doc.tabs.length > 1;
                const activeSeg = active ? "bg-[#34369C] text-white" : "bg-white text-[#1F1750]";
                const borderBetween = active ? "border-l border-white/25" : "border-l border-slate-200/90";
                return (
                  <div
                    key={t.id}
                    className={`inline-flex items-stretch overflow-hidden rounded-lg border shadow-sm ${
                      active ? "border-[#34369C]/45 ring-1 ring-[#34369C]/15" : "border-slate-200/90"
                    }`}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => selectTab(t.id)}
                      onDoubleClick={(ev) => {
                        ev.preventDefault();
                        renameTab(t.id, t.label);
                      }}
                      title="Select tab · double-click to rename"
                      className={`max-w-[8.25rem] truncate px-2 py-1 text-left font-outfit text-[10px] font-semibold transition-colors hover:opacity-95 ${activeSeg} ${
                        active ? "hover:bg-[#2f318f]" : "hover:bg-slate-50"
                      }`}
                    >
                      {t.label}
                    </button>
                    <button
                      type="button"
                      aria-label={`Rename ${t.label}`}
                      title="Rename tab"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        renameTab(t.id, t.label);
                      }}
                      className={`inline-flex items-center justify-center px-1.5 py-1 ${activeSeg} ${borderBetween} ${
                        active ? "hover:bg-[#2f318f]" : "bg-slate-50 text-[#34369C] hover:bg-[#eef0ff]"
                      }`}
                    >
                      <FiEdit2 size={11} aria-hidden />
                    </button>
                    {removable ? (
                      <button
                        type="button"
                        title={`Remove tab "${t.label}"`}
                        aria-label={`Remove tab ${t.label}`}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          removeTab(t.id);
                        }}
                        className={`inline-flex items-center justify-center px-1.5 py-1 ${borderBetween} ${
                          active
                            ? "bg-[#34369C] text-white hover:bg-red-600 hover:text-white"
                            : "bg-slate-50 text-[#5c5878] hover:bg-red-50 hover:text-red-700"
                        }`}
                      >
                        <FiX size={12} aria-hidden />
                      </button>
                    ) : null}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={addCustomTab}
                className="inline-flex items-center gap-0.5 rounded-lg border border-dashed border-[#34369C]/35 bg-white px-2 py-1 font-outfit text-[10px] font-semibold text-[#34369C] hover:bg-[#f4f5ff]"
                title="Add a custom tab"
              >
                <FiPlus size={12} aria-hidden />
                Tab
              </button>
            </div>
          ) : (
            <div className="h-8 shrink-0 border-b border-transparent" aria-hidden />
          )}

          <div
            ref={canvasRef}
            className="relative min-h-0 w-full flex-1 overflow-hidden rounded-2xl border-2 border-dashed border-slate-400/50 bg-[#e2e6ef] shadow-[inset_0_2px_12px_rgba(255,255,255,0.45)] lg:min-h-[calc(100dvh-8.25rem)]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={onCanvasDrop}
            onClick={() => setSelectedId(null)}
          >
            {!hydrated || !doc ? (
              <div className="absolute inset-0 flex items-center justify-center font-outfit text-sm text-[#8b87a8]">
                Loading…
              </div>
            ) : nodes.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center font-outfit text-sm text-[#8b87a8]">
                <span>
                  Drop <span className="font-semibold text-[#5c5878]">fields</span>,{" "}
                  <span className="font-semibold text-[#5c5878]">widgets</span>, or{" "}
                  <span className="font-semibold text-[#5c5878]">elements</span> on{" "}
                  <span className="font-semibold text-[#5c5878]">{activeTab?.label ?? "this tab"}</span>.
                </span>
                <span className="font-outfit text-[10px] text-[#a8a4b8]">Use the Style tab after selecting an item.</span>
              </div>
            ) : null}

            {nodes.map((n) => (
              <CanvasPlacedNode
                key={n.id}
                node={n}
                lead={previewLead}
                leftRailFieldIds={leftRailFieldIdsForCanvas}
                selected={selectedId === n.id}
                canvasRef={canvasRef}
                onSelect={() => {
                  setSelectedId(n.id);
                  bringToFront(n.id);
                }}
                onDelete={() => removeNode(n.id)}
                onChange={(patch) => patchNode(n.id, patch)}
                onStagePreview={(stage) => setPreviewLead((prev) => ({ ...prev, stage }))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
