"use client";

import { useCallback, useState } from "react";
import { FiChevronDown, FiChevronUp, FiLock } from "react-icons/fi";
import {
  LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT,
  LEFT_RAIL_FIELD_STORAGE_KEY,
  defaultLeftRailFieldConfig,
  getOrderedVisibleIds,
} from "@/lib/left-rail-field-config";
import { type LeftRailFieldId } from "@/lib/left-rail-field-registry";
import { LeadRailFieldConfiguratorPanel } from "@/components/developer/LeadRailFieldConfiguratorPanel";
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

function pickPreviewLead(): LeadRow {
  const row = SAMPLE_LEADS.find((l) => l.id === "4" || l.leadId === "L0226000001");
  return row ? { ...row } : { ...SAMPLE_LEADS[0] };
}

export function WidgetLayoutAdminPage() {
  /** Which catalog row has its settings panel open (`null` = none). */
  const [openWidgetId, setOpenWidgetId] = useState<string | null>(null);
  const [orderedVisibleIds, setOrderedVisibleIds] = useState<LeftRailFieldId[]>(() =>
    getOrderedVisibleIds(defaultLeftRailFieldConfig()),
  );
  const [previewLead, setPreviewLead] = useState<LeadRow>(pickPreviewLead);

  const onLeftRailVisibleIds = useCallback((ids: LeftRailFieldId[]) => {
    setOrderedVisibleIds(ids);
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
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(10.5rem,13.5rem)_minmax(0,1fr)] lg:gap-5 xl:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)]">
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
                      className="flex min-h-[1.75rem] items-center justify-start rounded border border-slate-200/90 bg-[#f8f9fc] px-2 py-0.5 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                    >
                      <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
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
                      className="flex w-full min-h-[1.75rem] items-center justify-start px-2 py-0.5 text-left transition-colors hover:bg-white/80"
                    >
                      <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                        <span className="min-w-0 truncate font-outfit text-[11px] font-semibold leading-tight text-[#1F1750]">
                          {w.title}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-0.5 text-[#34369C]">
                          <span className="font-outfit text-[9px] font-semibold uppercase tracking-wide">
                            Configure
                          </span>
                          {isOpen ? (
                            <FiChevronUp size={13} className="shrink-0" aria-hidden />
                          ) : (
                            <FiChevronDown size={13} className="shrink-0" aria-hidden />
                          )}
                        </span>
                      </span>
                    </button>

                    {isOpen && w.configurator === "leadRail" ? (
                      <div
                        id={`widget-panel-${w.id}`}
                        role="region"
                        aria-labelledby={rowTitleId}
                        className="border-t border-slate-200/80 bg-white px-2 pb-2 pt-2"
                      >
                        <LeadRailFieldConfiguratorPanel
                          storageKey={LEFT_RAIL_FIELD_STORAGE_KEY}
                          changeEvent={LEFT_RAIL_FIELD_CONFIG_CHANGED_EVENT}
                          intro="Applies to manage-leads and this V1 preview. Drag to reorder; eye toggles visibility. Live preview →"
                          onVisibleIdsChange={onLeftRailVisibleIds}
                        />
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
