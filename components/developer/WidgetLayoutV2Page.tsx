"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronDown, FiChevronUp, FiEdit2, FiPlus, FiX } from "react-icons/fi";
import { MdDeleteOutline, MdSave } from "react-icons/md";
import { LeadRailFieldConfiguratorPanel } from "@/components/developer/LeadRailFieldConfiguratorPanel";
import { WidgetV2CanvasBlockBody } from "@/components/developer/WidgetV2CanvasBlockBody";
import { useLeftRailFieldConfigV2 } from "@/components/manage-leads/useLeftRailFieldConfig";
import { DEVELOPER_WIDGET_CANVAS_PALETTE } from "@/lib/developer-widget-canvas-catalog";
import {
  LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT_V2,
  LEFT_RAIL_FIELD_STORAGE_KEY_V2,
} from "@/lib/left-rail-field-config";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import {
  loadWidgetCanvasV2Document,
  saveWidgetCanvasV2Document,
} from "@/lib/widget-canvas-v2-storage";
import type { PlacedCanvasWidget, WidgetCanvasV2Document } from "@/lib/widget-canvas-v2-types";
import { isKawalReferenceLead } from "@/lib/lead-detail-fixtures";
import { SAMPLE_LEADS, type LeadRow } from "@/lib/leads-sample-data";

function pickCanvasSampleLead(): LeadRow {
  const row = SAMPLE_LEADS.find((l) => isKawalReferenceLead(l));
  return row ? { ...row } : { ...SAMPLE_LEADS[0] };
}

const DND_TYPE = "application/x-sirrus-widget-v2";
const MIN_W = 0.12;
const MIN_H = 0.1;

type ResizeEdgeKind = "se" | "e" | "s";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `w-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function WidgetLayoutV2Page() {
  const [doc, setDoc] = useState<WidgetCanvasV2Document | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewLead] = useState<LeadRow>(pickCanvasSampleLead);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { orderedVisibleIds: v2PersistedRailIds } = useLeftRailFieldConfigV2();
  const [canvasLeftRailIds, setCanvasLeftRailIds] = useState<LeftRailFieldId[] | null>(null);
  const leftRailFieldIdsForCanvas = canvasLeftRailIds ?? v2PersistedRailIds;
  /** Lead Details row in palette: expand for left-rail config (same idea as V1 widgets list). */
  const [openPaletteId, setOpenPaletteId] = useState<string | null>(null);
  const [saveAck, setSaveAck] = useState(false);
  const saveAckTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const widgets = activeTab?.widgets ?? [];

  const bringToFront = useCallback(
    (wid: string) => {
      applyDoc((d) => {
        const tid = d.activeTabId;
        const tab = d.tabs.find((t) => t.id === tid);
        if (!tab) return d;
        const z = tab.widgets.length ? Math.max(...tab.widgets.map((w) => w.z)) + 1 : 1;
        const nextWidgets = tab.widgets.map((w) => (w.id === wid ? { ...w, z } : w));
        return { ...d, tabs: d.tabs.map((t) => (t.id === tid ? { ...t, widgets: nextWidgets } : t)) };
      });
    },
    [applyDoc],
  );

  const onCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DND_TYPE);
      if (!raw || !canvasRef.current) return;
      let payload: { id: string; title: string; defaultW: number; defaultH: number };
      try {
        payload = JSON.parse(raw) as typeof payload;
      } catch {
        return;
      }
      const rect = canvasRef.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const w = clamp(payload.defaultW, MIN_W, 1);
      const h = clamp(payload.defaultH, MIN_H, 1);
      const x = clamp(px - w / 2, 0, 1 - w);
      const y = clamp(py - h / 2, 0, 1 - h);
      const wid = newId();
      applyDoc((d) => {
        const tid = d.activeTabId;
        const tab = d.tabs.find((t) => t.id === tid);
        if (!tab) return d;
        const z = tab.widgets.length ? Math.max(...tab.widgets.map((q) => q.z)) + 1 : 1;
        const nw: PlacedCanvasWidget = {
          id: wid,
          kind: payload.id,
          title: payload.title,
          x,
          y,
          w,
          h,
          z,
        };
        return { ...d, tabs: d.tabs.map((t) => (t.id === tid ? { ...t, widgets: [...t.widgets, nw] } : t)) };
      });
      setSelectedId(wid);
    },
    [applyDoc],
  );

  const clearCanvas = useCallback(() => {
    applyDoc((d) => ({
      ...d,
      tabs: d.tabs.map((t) => (t.id === d.activeTabId ? { ...t, widgets: [] } : t)),
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
      tabs: [...d.tabs, { id: tabId, label, widgets: [] }],
      activeTabId: tabId,
    }));
    setSelectedId(null);
  }, [applyDoc]);

  const removeWidget = useCallback(
    (widgetId: string) => {
      applyDoc((d) => {
        const tid = d.activeTabId;
        return {
          ...d,
          tabs: d.tabs.map((t) =>
            t.id !== tid ? t : { ...t, widgets: t.widgets.filter((q) => q.id !== widgetId) },
          ),
        };
      });
      setSelectedId((cur) => (cur === widgetId ? null : cur));
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId || !doc) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        applyDoc((d) => {
          const tid = d.activeTabId;
          return {
            ...d,
            tabs: d.tabs.map((t) =>
              t.id === tid ? { ...t, widgets: t.widgets.filter((w) => w.id !== selectedId) } : t,
            ),
          };
        });
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, doc, applyDoc]);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-5.5rem)] w-full max-w-[min(100%,1920px)] flex-col gap-2 pb-4 pt-0">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <h1 className="font-outfit text-base font-semibold tracking-tight text-[#1F1750]">Widgets V2</h1>
        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href="/developer/lead-detail"
            className="rounded-md px-2 py-1 font-outfit text-[10px] font-semibold text-[#34369C] hover:bg-[#34369C]/10"
          >
            Lead detail
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
            Clear
          </button>
        </div>
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-2 md:grid-cols-[12.5rem_minmax(0,1fr)] md:gap-3">
        <aside className="flex max-h-[min(40vh,320px)] min-h-0 shrink-0 flex-col rounded-xl border border-[#34369C]/20 bg-gradient-to-br from-[#f4f5ff] to-white p-2 shadow-sm md:max-h-none md:w-[12.5rem] md:justify-self-stretch">
          <h2 className="shrink-0 font-outfit text-[10px] font-semibold uppercase tracking-wide text-[#6b6578]">
            Palette
          </h2>
          <ul className="mt-1.5 min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]" role="list">
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
                      aria-grabbed="false"
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DND_TYPE, dndPayload);
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
                      aria-grabbed="false"
                      onDragStart={(e) => {
                        e.dataTransfer.setData(DND_TYPE, dndPayload);
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
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1.5">
          {doc ? (
            <div
              className="flex shrink-0 flex-wrap items-center gap-1 border-b border-slate-200/80 pb-1.5"
              role="tablist"
              aria-label="Lead detail tabs"
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
                      onDoubleClick={(e) => {
                        e.preventDefault();
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
                      onClick={(e) => {
                        e.stopPropagation();
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
                        onClick={(e) => {
                          e.stopPropagation();
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
            className="relative min-h-0 w-full flex-1 overflow-hidden rounded-2xl border-2 border-dashed border-slate-400/50 bg-[#e2e6ef] shadow-[inset_0_2px_12px_rgba(255,255,255,0.45)] md:min-h-[calc(100dvh-8.25rem)]"
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
            ) : widgets.length === 0 ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center font-outfit text-sm text-[#8b87a8]">
                <span>
                  Drop widgets on <span className="font-semibold text-[#5c5878]">{activeTab?.label ?? "this tab"}</span>
                  .
                </span>
                <span className="font-outfit text-[10px] text-[#a8a4b8]">Each tab has its own layout (like Overview vs Lead Journey).</span>
              </div>
            ) : null}

            {widgets.map((w) => (
              <CanvasWidget
                key={w.id}
                widget={w}
                lead={previewLead}
                leftRailFieldIds={leftRailFieldIdsForCanvas}
                selected={selectedId === w.id}
                canvasRef={canvasRef}
                onSelect={() => {
                  setSelectedId(w.id);
                  bringToFront(w.id);
                }}
                onDelete={() => removeWidget(w.id)}
                onChange={(patch) => {
                  applyDoc((d) => {
                    const tid = d.activeTabId;
                    return {
                      ...d,
                      tabs: d.tabs.map((t) =>
                        t.id !== tid
                          ? t
                          : { ...t, widgets: t.widgets.map((q) => (q.id === w.id ? { ...q, ...patch } : q)) },
                      ),
                    };
                  });
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasWidget({
  widget,
  lead,
  leftRailFieldIds,
  selected,
  canvasRef,
  onSelect,
  onDelete,
  onChange,
}: {
  widget: PlacedCanvasWidget;
  lead: LeadRow;
  leftRailFieldIds: LeftRailFieldId[];
  selected: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onDelete: () => void;
  onChange: (patch: Partial<PlacedCanvasWidget>) => void;
}) {
  const widgetRef = useRef(widget);
  widgetRef.current = widget;

  const interaction = useRef<
    | { mode: "move"; px: number; py: number; x0: number; y0: number }
    | {
        mode: "resize";
        kind: ResizeEdgeKind;
        px: number;
        py: number;
        w0: number;
        h0: number;
        x0: number;
        y0: number;
      }
    | null
  >(null);
  const captureTargetRef = useRef<HTMLElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onPointerMoveInner = useRef<(e: PointerEvent) => void>(() => {});
  const onPointerUpInner = useRef<(e: PointerEvent) => void>(() => {});

  const onPointerMoveStable = useCallback((e: PointerEvent) => {
    onPointerMoveInner.current(e);
  }, []);

  const onPointerUpStable = useCallback((e: PointerEvent) => {
    onPointerUpInner.current(e);
  }, []);

  onPointerMoveInner.current = (e: PointerEvent) => {
    const canvas = canvasRef.current;
    const state = interaction.current;
    if (!canvas || !state) return;
    const rect = canvas.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const w = widgetRef.current;

    if (state.mode === "move") {
      const dx = fx - state.px;
      const dy = fy - state.py;
      onChangeRef.current({
        x: clamp(state.x0 + dx, 0, 1 - w.w),
        y: clamp(state.y0 + dy, 0, 1 - w.h),
      });
    } else {
      const dw = fx - state.px;
      const dh = fy - state.py;
      const patch: Partial<PlacedCanvasWidget> = {};
      if (state.kind === "se" || state.kind === "e") {
        patch.w = clamp(state.w0 + dw, MIN_W, 1 - state.x0);
      }
      if (state.kind === "se" || state.kind === "s") {
        patch.h = clamp(state.h0 + dh, MIN_H, 1 - state.y0);
      }
      onChangeRef.current(patch);
    }
  };

  onPointerUpInner.current = (e: PointerEvent) => {
    if (captureTargetRef.current?.hasPointerCapture(e.pointerId)) {
      try {
        captureTargetRef.current.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
    captureTargetRef.current = null;
    interaction.current = null;
    window.removeEventListener("pointermove", onPointerMoveStable);
    window.removeEventListener("pointerup", onPointerUpStable);
  };

  const startMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    interaction.current = {
      mode: "move",
      px: (e.clientX - rect.left) / rect.width,
      py: (e.clientY - rect.top) / rect.height,
      x0: widget.x,
      y0: widget.y,
    };
    captureTargetRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    window.addEventListener("pointermove", onPointerMoveStable);
    window.addEventListener("pointerup", onPointerUpStable);
  };

  const startResize =
    (kind: ResizeEdgeKind) => (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      interaction.current = {
        mode: "resize",
        kind,
        px: (e.clientX - rect.left) / rect.width,
        py: (e.clientY - rect.top) / rect.height,
        w0: widget.w,
        h0: widget.h,
        x0: widget.x,
        y0: widget.y,
      };
      captureTargetRef.current = e.currentTarget;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      window.addEventListener("pointermove", onPointerMoveStable);
      window.addEventListener("pointerup", onPointerUpStable);
    };

  return (
    <div
      role="presentation"
      className={`isolate absolute flex h-full select-none flex-col rounded-xl border-2 bg-white/95 shadow-lg backdrop-blur-sm transition-shadow ${
        selected ? "border-[#34369C] shadow-[0_8px_28px_-8px_rgba(52,54,156,0.35)]" : "border-slate-300/80"
      }`}
      style={{
        left: `${widget.x * 100}%`,
        top: `${widget.y * 100}%`,
        width: `${widget.w * 100}%`,
        height: `${widget.h * 100}%`,
        zIndex: widget.z,
        touchAction: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="relative z-30 flex shrink-0 touch-none items-center gap-1 rounded-t-[10px] border-b border-slate-200/80 bg-gradient-to-r from-[#f4f5ff] to-white px-1.5 py-0.5">
        <div
          onPointerDown={startMove}
          className="flex min-w-0 flex-1 cursor-grab items-center gap-1 py-0.5 active:cursor-grabbing"
        >
          <span className="min-w-0 truncate font-outfit text-[10px] font-semibold text-[#1F1750]">{widget.title}</span>
          <span className="shrink-0 font-outfit text-[9px] font-medium text-[#8b87a8]">{widget.kind}</span>
        </div>
        {selected ? (
          <button
            type="button"
            aria-label={`Remove ${widget.title}`}
            title="Remove widget"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex shrink-0 rounded-md border border-red-200/90 bg-white p-1 text-red-600 shadow-sm hover:bg-red-50"
          >
            <MdDeleteOutline size={14} aria-hidden />
          </button>
        ) : null}
      </div>
      <div className="relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <WidgetV2CanvasBlockBody kind={widget.kind} lead={lead} leftRailFieldIds={leftRailFieldIds} />
      </div>
      {/* East: width only */}
      <button
        type="button"
        aria-label={`Resize width of ${widget.title}`}
        onPointerDown={startResize("e")}
        className="pointer-events-auto absolute right-0 top-9 bottom-9 z-20 w-2 cursor-ew-resize touch-none border-0 bg-transparent p-0 outline-none"
      />
      {/* South: height only */}
      <button
        type="button"
        aria-label={`Resize height of ${widget.title}`}
        onPointerDown={startResize("s")}
        className="pointer-events-auto absolute bottom-0 left-2 right-9 z-20 h-2 cursor-ns-resize touch-none border-0 bg-transparent p-0 outline-none"
      />
      {/* South-east: both */}
      <button
        type="button"
        aria-label={`Resize ${widget.title}`}
        onPointerDown={startResize("se")}
        className="pointer-events-auto absolute bottom-0 right-0 z-30 flex h-9 w-9 cursor-nwse-resize touch-none items-end justify-end border-0 bg-transparent p-0 outline-none"
      >
        <span
          className="mb-0.5 mr-0.5 block h-3.5 w-3.5 rounded-sm border-2 border-[#34369C]/50 bg-white shadow-md ring-1 ring-white/90"
          aria-hidden
        />
      </button>
    </div>
  );
}
