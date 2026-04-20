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
import { createConfiguratorV1PreviewLead } from "@/lib/configurator-v1-preview-lead";
import type { LeadRow } from "@/lib/leads-sample-data";
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
    description: "Perception, Ability, Intent, and Readiness score cards on the Overview tab.",
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
    title: "All Tasks",
    description: "All tasks with due dates and status (pending, overdue, completed) in the Overview column.",
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
    description: "Main lead detail tabs: Overview (hub), AI Insights, Lead Journey, Lead Overview, stage change, etc.",
    configurator: "leadRail",
  },
  {
    id: "lead-status-history",
    title: "Lead status history",
    description: "Timeline of stage changes in the Overview hub grid.",
    configurator: null,
  },
];

const LOCK_CUSTOMIZATION_MESSAGE = "Customization coming soon";

export function WidgetLayoutAdminPage() {
  /** Which catalog row has its settings panel open (`null` = none). */
  const [openWidgetId, setOpenWidgetId] = useState<string | null>(null);
  /** Locked-row lock control: brief message after click (also hover via `title` on the button). */
  const [lockTipWidgetId, setLockTipWidgetId] = useState<string | null>(null);
  const [orderedVisibleIds, setOrderedVisibleIds] = useState<LeftRailFieldId[]>(() =>
    getOrderedVisibleIds(defaultLeftRailFieldConfig()),
  );
  const [previewLead, setPreviewLead] = useState<LeadRow>(() => createConfiguratorV1PreviewLead());

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
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(9rem,11.5rem)_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[minmax(9.5rem,12rem)_minmax(0,1fr)]">
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
                      className="flex min-h-[1.75rem] flex-col rounded border border-slate-200/90 bg-[#f8f9fc] px-2 py-0.5 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
                    >
                      <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                        <span
                          className="min-w-0 truncate font-outfit text-[11px] font-semibold leading-tight text-[#1F1750]"
                          title={w.description}
                        >
                          {w.title}
                        </span>
                        <span className="sr-only">{w.description}</span>
                        <button
                          type="button"
                          title={LOCK_CUSTOMIZATION_MESSAGE}
                          aria-label={`${w.title}, locked. ${LOCK_CUSTOMIZATION_MESSAGE}`}
                          className="inline-flex shrink-0 cursor-pointer items-center rounded p-0.5 text-[#9ca3af] transition-colors hover:bg-slate-200/60 hover:text-[#6b7280] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#34369C]"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLockTipWidgetId(w.id);
                            window.setTimeout(() => {
                              setLockTipWidgetId((cur) => (cur === w.id ? null : cur));
                            }, 2800);
                          }}
                        >
                          <FiLock size={11} strokeWidth={2.25} aria-hidden />
                        </button>
                      </span>
                      {lockTipWidgetId === w.id ? (
                        <p
                          className="mt-1 font-outfit text-[10px] font-medium leading-snug text-[#34369C]"
                          role="status"
                        >
                          {LOCK_CUSTOMIZATION_MESSAGE}
                        </p>
                      ) : null}
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
          {/* Same surface as manage-leads drawer — no extra padded “workspace” so Overview hub columns match prod width. */}
          <div className="flex h-[min(52vh,520px)] min-h-[300px] w-full flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-[#e8ebf4] sm:h-[min(56vh,580px)] lg:h-[min(68vh,760px)] lg:max-h-[calc(100dvh-6rem)]">
            <LeadDetailPagePreview
              builderCanvas
              showPreviewBadge={false}
              lead={previewLead}
              leftRailFieldIds={orderedVisibleIds}
              onLeadPatch={onPreviewLeadPatch}
              onStageChange={onPreviewStageChange}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
