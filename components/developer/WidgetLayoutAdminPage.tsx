"use client";

import { type DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BsGripVertical } from "react-icons/bs";
import { FiChevronDown, FiChevronUp, FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import {
  defaultLeftRailFieldConfig,
  loadLeftRailFieldConfig,
  saveLeftRailFieldConfig,
} from "@/lib/left-rail-field-config";
import { LEFT_RAIL_FIELD_DEFINITIONS, type LeftRailFieldId } from "@/lib/left-rail-field-registry";
import { SAMPLE_LEADS, type LeadRow } from "@/lib/leads-sample-data";
import { LeadDetailPagePreview } from "./LeadDetailPagePreview";

/** `configurator` = which panel opens for this widget; null = none yet (locked). */
type WidgetCatalogEntry = {
  id: string;
  title: string;
  description: string;
  configurator: null | "leadRail";
};

const WIDGET_CATALOG: readonly WidgetCatalogEntry[] = [
  {
    id: "pair",
    title: "PAIR Score",
    description: "Perception, Ability, Intent, and Readiness score cards on the Activity tab.",
    configurator: null,
  },
  {
    id: "ai-summary",
    title: "AI Summary",
    description: "AI-generated summary strip with expandable rationale.",
    configurator: null,
  },
  {
    id: "open-tasks",
    title: "Open Tasks",
    description: "Task list with due dates and status in the Activity column.",
    configurator: null,
  },
  {
    id: "notes",
    title: "Notes",
    description: "Remarks and filters (Call feedback, comments, stage changes).",
    configurator: null,
  },
  {
    id: "lead-details",
    title: "Lead Details",
    description: "Main lead detail tabs: Activity, Journey, Overview, stage change, etc.",
    configurator: "leadRail",
  },
  {
    id: "lead-status-history",
    title: "Lead status history",
    description: "Timeline of stage changes in the Activity grid.",
    configurator: null,
  },
];

function moveIndex<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function pickPreviewLead(): LeadRow {
  const row = SAMPLE_LEADS.find((l) => l.id === "4" || l.leadId === "L0226000001");
  return row ? { ...row } : { ...SAMPLE_LEADS[0] };
}

export function WidgetLayoutAdminPage() {
  /** Which catalog row has its settings panel open (`null` = none). */
  const [openWidgetId, setOpenWidgetId] = useState<string | null>(null);
  const [orderedIds, setOrderedIds] = useState<LeftRailFieldId[]>(() => defaultLeftRailFieldConfig().orderedIds);
  const [hiddenIds, setHiddenIds] = useState<LeftRailFieldId[]>(() => defaultLeftRailFieldConfig().hiddenIds);
  const [hydrated, setHydrated] = useState(false);
  const [previewLead, setPreviewLead] = useState<LeadRow>(pickPreviewLead);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const cfg = loadLeftRailFieldConfig();
      setOrderedIds(cfg.orderedIds);
      setHiddenIds(cfg.hiddenIds);
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);

  const orderedVisibleIds = useMemo(
    () => orderedIds.filter((id) => !hiddenSet.has(id)),
    [orderedIds, hiddenSet],
  );

  const labelById = useMemo(() => {
    const m = new Map<LeftRailFieldId, string>();
    for (const d of LEFT_RAIL_FIELD_DEFINITIONS) m.set(d.id, d.label);
    return m;
  }, []);

  const toggleFieldVisibility = useCallback((id: LeftRailFieldId) => {
    setHiddenIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return [...s];
    });
  }, []);

  const onDragOverRow = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDropOnRow = useCallback((dropIndex: number) => {
    return (e: DragEvent) => {
      e.preventDefault();
      const from = Number(e.dataTransfer.getData("text/plain"));
      if (Number.isNaN(from) || from === dropIndex) return;
      setOrderedIds((prev) => moveIndex(prev, from, dropIndex));
    };
  }, []);

  const saveFields = useCallback(() => {
    const d = defaultLeftRailFieldConfig();
    const next: { orderedIds: LeftRailFieldId[]; hiddenIds: LeftRailFieldId[] } =
      orderedIds.length > 0 ? { orderedIds, hiddenIds } : { orderedIds: d.orderedIds, hiddenIds: d.hiddenIds };
    saveLeftRailFieldConfig(next);
    setOrderedIds(next.orderedIds);
    setHiddenIds(next.hiddenIds);
  }, [orderedIds, hiddenIds]);

  const resetFields = useCallback(() => {
    const d = defaultLeftRailFieldConfig();
    setOrderedIds(d.orderedIds);
    setHiddenIds(d.hiddenIds);
    saveLeftRailFieldConfig(d);
  }, []);

  const onPreviewLeadPatch = useCallback((patch: Partial<LeadRow>) => {
    setPreviewLead((prev) => ({ ...prev, ...patch }));
  }, []);

  const onPreviewStageChange = useCallback((stage: string) => {
    setPreviewLead((prev) => ({ ...prev, stage }));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[min(100%,1920px)] pb-6 pt-1">
      <h1 className="mb-3 font-outfit text-lg font-semibold tracking-tight text-[#1F1750]">
        Widget & layout
      </h1>

      {/* Config first on mobile; side-by-side on lg — tops align with widgets card */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(220px,17rem)_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[minmax(232px,18rem)_minmax(0,1fr)]">
        <div className="order-1 flex min-h-0 flex-col gap-3 lg:sticky lg:top-2 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-1 [scrollbar-width:thin]">
          <div className="rounded-xl border border-[#34369C]/20 bg-gradient-to-br from-[#f4f5ff] to-white p-2.5 shadow-sm">
            <h2 className="font-outfit text-xs font-semibold uppercase tracking-wide text-[#6b6578]">
              Widgets
            </h2>
            <p className="mt-0.5 font-outfit text-[10px] leading-snug text-[#8b87a8]">
              Open a widget to configure it. Others stay locked until their panel ships.
            </p>
            <ul className="mt-2 space-y-1" role="list">
              {WIDGET_CATALOG.map((w) => {
                const hasConfigurator = w.configurator !== null;
                const isOpen = openWidgetId === w.id;
                const rowTitleId = `widget-cat-${w.id}`;

                if (!hasConfigurator) {
                  return (
                    <li
                      key={w.id}
                      title={w.description}
                      className="flex min-h-[1.75rem] items-center justify-between gap-1.5 rounded border border-slate-200/90 bg-[#f8f9fc] px-2 py-0.5 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                    >
                      <span className="min-w-0 truncate font-outfit text-[11px] font-semibold leading-tight text-[#1F1750]">
                        {w.title}
                      </span>
                      <span className="sr-only">{w.description}</span>
                      <span
                        className="inline-flex shrink-0 items-center text-[#9ca3af]"
                        aria-label={`${w.title}, locked`}
                      >
                        <FiLock size={11} strokeWidth={2.25} aria-hidden />
                      </span>
                    </li>
                  );
                }

                return (
                  <li
                    key={w.id}
                    className={`overflow-hidden rounded border shadow-[0_1px_0_rgba(15,23,42,0.04)] ${
                      isOpen ? "border-[#34369C]/35 bg-white" : "border-slate-200/90 bg-[#f8f9fc]"
                    }`}
                  >
                    <button
                      type="button"
                      id={rowTitleId}
                      aria-expanded={isOpen}
                      aria-controls={`widget-panel-${w.id}`}
                      onClick={() => setOpenWidgetId((cur) => (cur === w.id ? null : w.id))}
                      className="flex w-full min-h-[1.75rem] items-center justify-between gap-2 px-2 py-0.5 text-left transition-colors hover:bg-white/80"
                    >
                      <span className="min-w-0 flex-1 truncate font-outfit text-[11px] font-semibold leading-tight text-[#1F1750]">
                        {w.title}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1">
                        <span className="font-outfit text-[9px] font-semibold uppercase tracking-wide text-[#34369C]">
                          Configure
                        </span>
                        {isOpen ? (
                          <FiChevronUp size={14} className="text-[#34369C]" aria-hidden />
                        ) : (
                          <FiChevronDown size={14} className="text-[#34369C]" aria-hidden />
                        )}
                      </span>
                    </button>

                    {isOpen && w.configurator === "leadRail" ? (
                      <div
                        id={`widget-panel-${w.id}`}
                        role="region"
                        aria-labelledby={rowTitleId}
                        className="border-t border-slate-200/80 bg-white px-2 pb-2 pt-2"
                      >
                        <p className="font-outfit text-[10px] leading-snug text-[#8b87a8]">
                          Left rail summary fields (Lead details). Drag to reorder; eye toggles visibility. Live preview →
                        </p>

                        {!hydrated ? (
                          <p className="mt-2 font-outfit text-xs text-[#8b87a8]">Loading…</p>
                        ) : (
                          <>
                            <ul
                              className="mt-2 max-h-[min(40vh,360px)] space-y-px overflow-y-auto rounded-md border border-slate-100 bg-slate-50/80 py-0.5 [scrollbar-width:thin]"
                              role="list"
                            >
                              {orderedIds.map((id, index) => {
                                const hidden = hiddenSet.has(id);
                                return (
                                  <li
                                    key={id}
                                    onDragOver={onDragOverRow}
                                    onDrop={onDropOnRow(index)}
                                    className="flex min-h-[1.625rem] items-center gap-1 px-1"
                                  >
                                    <button
                                      type="button"
                                      draggable
                                      aria-label={`Reorder ${labelById.get(id) ?? id}`}
                                      className="-ml-0.5 inline-flex shrink-0 cursor-grab touch-none rounded border-0 bg-transparent p-0.5 text-[#b4b8c4] active:cursor-grabbing"
                                      onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = "move";
                                        e.dataTransfer.setData("text/plain", String(index));
                                      }}
                                    >
                                      <BsGripVertical size={14} aria-hidden />
                                    </button>
                                    <span
                                      className={`min-w-0 flex-1 truncate font-outfit text-[11px] leading-tight ${
                                        hidden ? "font-normal text-[#b0aec4]" : "font-semibold text-[#1F1750]"
                                      }`}
                                    >
                                      {labelById.get(id) ?? id}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => toggleFieldVisibility(id)}
                                      className={`inline-flex shrink-0 rounded p-0.5 transition-colors ${
                                        hidden
                                          ? "text-[#b0aec4] hover:bg-slate-200/60 hover:text-[#8b87a8]"
                                          : "text-[#34369C] hover:bg-[#34369C]/10"
                                      }`}
                                      aria-label={
                                        hidden ? `Show ${labelById.get(id) ?? id}` : `Hide ${labelById.get(id) ?? id}`
                                      }
                                      title={hidden ? "Show in left rail" : "Hide from left rail"}
                                    >
                                      {hidden ? (
                                        <FiEyeOff size={15} strokeWidth={2} aria-hidden />
                                      ) : (
                                        <FiEye size={15} strokeWidth={2} aria-hidden />
                                      )}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>

                            <div className="mt-2.5 flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={saveFields}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#34369C] px-2 py-1.5 font-outfit text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                              >
                                <MdSave size={14} aria-hidden />
                                Save layout
                              </button>
                              <button
                                type="button"
                                onClick={resetFields}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-outfit text-[11px] font-semibold text-[#5c5878] hover:bg-slate-50"
                              >
                                Reset
                              </button>
                            </div>
                            <p className="mt-1.5 font-outfit text-[9px] leading-snug text-[#a8a4b8]">
                              <code className="rounded bg-slate-100 px-0.5">localStorage</code> in this browser.
                            </p>
                          </>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <section
          className="order-2 flex min-h-0 w-full min-w-0 flex-1 flex-col lg:min-h-[min(72vh,820px)]"
          aria-label="Lead detail preview"
        >
          {/* Canvas workspace (Zoho-style): mid-gray field; white shell = composed widget(s). Add more shells here later. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-500/30 bg-[#c9cfdb] p-2 shadow-[inset_0_2px_10px_rgba(255,255,255,0.28)] md:p-3">
            <div className="flex h-[min(52vh,520px)] min-h-[300px] w-full flex-1 flex-col overflow-hidden rounded-xl border-2 border-white bg-white shadow-[0_14px_44px_-12px_rgba(31,23,80,0.28)] ring-1 ring-[#34369C]/15 sm:h-[min(56vh,580px)] lg:h-[min(68vh,760px)] lg:max-h-[calc(100dvh-6rem)]">
              <div className="flex min-h-0 flex-1 flex-col">
                <LeadDetailPagePreview
                  builderCanvas
                  lead={previewLead}
                  leftRailFieldIds={orderedVisibleIds}
                  onLeadPatch={onPreviewLeadPatch}
                  onStageChange={onPreviewStageChange}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
