"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { LeadDetailV2TabCanvas } from "@/components/developer/LeadDetailV2TabCanvas";
import { useWidgetCanvasV2Document } from "@/components/developer/useWidgetCanvasV2Document";
import { LeadActivityHub } from "@/components/manage-leads/LeadActivityHub";
import { LeadDetailLeftRail } from "@/components/manage-leads/LeadDetailLeftRail";
import { LeadDetailMobileBar } from "@/components/manage-leads/LeadDetailMobileBar";
import { LeadDetailProjectStrip } from "@/components/manage-leads/LeadDetailProjectStrip";
import { LeadJourneyPanel } from "@/components/manage-leads/LeadJourneyPanel";
import { LeadOverviewPanel } from "@/components/manage-leads/LeadOverviewPanel";
import { LeadStageChangeForm } from "@/components/manage-leads/LeadStageChangeForm";
import { LEAD_DETAIL_TABS } from "@/lib/lead-detail-tabs";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import { widgetsForLeadDetailTabIndex } from "@/lib/widget-canvas-v2-storage";

function fundingForDrawer(lead: LeadRow) {
  if (lead.drawerFundingSource) return lead.drawerFundingSource;
  return lead.funding !== "-" ? lead.funding : "-";
}

type Props = {
  lead: LeadRow;
  leftRailFieldIds: LeftRailFieldId[];
  onLeadPatch: (patch: Partial<LeadRow>) => void;
  onStageChange: (stage: string) => void;
  /** When true, outer chrome is flat so the preview reads as one widget on a builder canvas (admin only). */
  builderCanvas?: boolean;
  /** Match `/developer/manage-leads` drawer: full-bleed rail + main (no card chrome). */
  layoutVariant?: "embedded" | "fullPage";
  /** “Preview” pill in the header (developer-only). */
  showPreviewBadge?: boolean;
  /** Tab bodies use widgets from Widgets V2 configurator when that tab has placed widgets. */
  syncV2Configurator?: boolean;
};

/**
 * Non-portal replica of the lead detail drawer for admin preview.
 * Left-rail summary rows follow `leftRailFieldIds` (live from parent state).
 */
export function LeadDetailPagePreview({
  lead,
  leftRailFieldIds,
  onLeadPatch,
  onStageChange,
  builderCanvas = false,
  layoutVariant = "embedded",
  showPreviewBadge = true,
  syncV2Configurator = false,
}: Props) {
  const [detailTab, setDetailTab] = useState(0);
  const v2Doc = useWidgetCanvasV2Document(syncV2Configurator);
  const v2SlotWidgets =
    syncV2Configurator && v2Doc ? widgetsForLeadDetailTabIndex(v2Doc, detailTab) : [];
  const showV2TabCanvas = syncV2Configurator && v2SlotWidgets.length > 0;
  /** V2 canvas owns this tab’s layout; fixed rail would duplicate or ignore “removed” lead-details on canvas. */
  const hideFixedLeftRail = showV2TabCanvas;

  const patchStage = useCallback(
    (stage: string) => {
      onStageChange(stage);
    },
    [onStageChange],
  );

  const rootChrome =
    layoutVariant === "fullPage"
      ? "rounded-none border-0 bg-[#e8ebf4] shadow-none"
      : builderCanvas
        ? "rounded-lg border border-slate-200/90 bg-white shadow-none"
        : "rounded-2xl border border-slate-300/60 bg-[#e8ebf4] shadow-[0_12px_40px_-12px_rgba(31,23,80,0.18)]";

  return (
    <div
      className={`flex h-full min-h-0 w-full flex-col overflow-hidden md:min-h-[220px] md:flex-row ${rootChrome} ${layoutVariant === "fullPage" ? "min-h-0 flex-1" : ""}`}
      aria-label="Lead detail layout preview"
    >
      <aside
        className={
          hideFixedLeftRail
            ? "hidden"
            : builderCanvas
              ? "flex h-full min-h-0 w-full min-w-0 max-w-[min(100%,360px)] shrink-0 flex-col overflow-y-auto border-b border-slate-200/60 shadow-[6px_0_40px_-12px_rgba(31,23,80,0.14)] max-md:max-h-[min(50dvh,420px)] sm:max-w-[380px] md:w-[300px] md:max-w-none md:max-h-none md:overflow-hidden md:border-b-0 lg:w-[352px]"
              : "hidden h-full min-h-0 w-[300px] shrink-0 flex-col overflow-hidden shadow-[6px_0_40px_-12px_rgba(31,23,80,0.14)] md:flex lg:w-[352px]"
        }
      >
        <LeadDetailLeftRail
          lead={lead}
          summaryFieldIds={leftRailFieldIds}
          onPatchLead={onLeadPatch}
        />
      </aside>

      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col border-[#d5d9e6] bg-[#eef1f8] ${hideFixedLeftRail ? "" : "md:border-l"}`}
      >
        <div className="flex shrink-0 flex-col gap-1.5 border-b border-slate-200/70 bg-white px-4 py-2 md:px-5 md:py-2.5">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <LeadDetailProjectStrip projectName={lead.project} />
            </div>
            {showPreviewBadge ? (
              <span className="mt-1 shrink-0 rounded-full border border-dashed border-slate-200 px-2 py-1 font-outfit text-[10px] font-semibold uppercase tracking-wide text-[#8b87a8]">
                Preview
              </span>
            ) : null}
          </div>
          <div className="min-w-0 md:hidden">
            <span className="truncate font-outfit text-sm font-semibold text-[#1F1750]">{lead.name}</span>
            <span className="block truncate font-outfit text-xs" style={{ color: "rgb(126, 122, 149)" }}>
              {lead.leadId}
            </span>
          </div>
        </div>

        <LeadDetailMobileBar lead={lead} />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-2 pt-1.5 md:px-4 md:pb-3">
          <div className="w-full shrink-0 overflow-x-auto overflow-y-hidden pb-1.5 [scrollbar-width:thin]">
            <div className="flex min-w-max gap-x-1.5 sm:gap-x-2.5">
              {LEAD_DETAIL_TABS.map((label, i) => {
                const active = i === detailTab;
                return (
                  <div key={label} className="relative flex-shrink-0 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => setDetailTab(i)}
                      className={`min-w-[6.5rem] rounded-t-2xl rounded-tr-[2.125rem] py-2.5 pr-8 pl-3 font-outfit whitespace-nowrap sm:min-w-[7.5rem] sm:py-3 sm:pr-10 ${
                        active ? "text-[15px] font-bold" : "text-[13px] font-medium text-[#5c5878]"
                      }`}
                      style={{
                        backgroundColor: active ? "rgb(255, 255, 255)" : "rgb(232, 234, 242)",
                        color: active ? "rgb(31, 23, 80)" : undefined,
                        boxShadow: active ? "0 -1px 0 0 white" : undefined,
                      }}
                    >
                      {label}
                    </button>
                    <div className="absolute top-0 right-0 bg-[#e8eaf2]">
                      <Image
                        src={active ? "/assets/images/tabCurve.svg" : "/assets/images/greyCurve.svg"}
                        alt=""
                        width={38}
                        height={48}
                        className="h-10 w-[2.375rem] sm:h-12"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className={`min-h-0 flex-1 rounded-2xl border border-slate-200/70 bg-white shadow-[0_4px_24px_-8px_rgba(31,23,80,0.08)] [scrollbar-width:thin] ${
              detailTab === 0 || showV2TabCanvas
                ? "flex min-h-0 flex-col overflow-y-auto overscroll-contain"
                : "overflow-y-auto"
            }`}
          >
            <div
              className={
                showV2TabCanvas || detailTab === 0
                  ? "flex min-h-0 flex-1 flex-col py-2 pl-3 pr-3 sm:py-3 sm:pl-4 sm:pr-4"
                  : detailTab === 2
                    ? "py-6 pl-4 pr-4 sm:pl-6 sm:pr-6"
                    : detailTab === 3
                      ? "p-0"
                      : "py-5 pl-4 pr-4 sm:pl-6 sm:pr-6"
              }
            >
              {showV2TabCanvas ? (
                <LeadDetailV2TabCanvas
                  widgets={v2SlotWidgets}
                  lead={lead}
                  leftRailFieldIds={leftRailFieldIds}
                  className="min-h-[min(52vh,560px)] flex-1"
                />
              ) : detailTab === 0 ? (
                <LeadActivityHub lead={lead} />
              ) : detailTab === 1 ? (
                <>
                  <div className="w-full">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      <div className="flex h-full flex-col">
                        <div
                          className="flex h-full flex-col rounded-2xl p-4"
                          style={{ backgroundColor: "rgb(241, 243, 252)" }}
                        >
                          <div className="mb-3 flex flex-row">
                            <Image src="/assets/images/PropertyPrefrence.svg" alt="" width={25} height={25} />
                            <h3 className="ml-2 text-base font-semibold" style={{ color: "rgb(31, 23, 80)" }}>
                              Property Preference
                            </h3>
                          </div>
                          <div className="ml-8 flex-1 rounded-xl">
                            <div className="text-xs font-normal" style={{ color: "rgb(126, 122, 149)" }}>
                              No preferences added yet
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex h-full flex-col gap-3">
                        <div
                          className="flex flex-col rounded-2xl p-4"
                          style={{ backgroundColor: "rgb(241, 243, 252)" }}
                        >
                          <div className="mb-3 flex flex-row">
                            <Image src="/assets/images/demographicProfileIcon.svg" alt="" width={25} height={25} />
                            <h3 className="ml-2 text-base font-semibold" style={{ color: "rgb(31, 23, 80)" }}>
                              Demographic Profile
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 rounded-xl bg-white px-4 pt-4 sm:grid-cols-3">
                            {(
                              [
                                ["Gender", lead.gender],
                                ["Age", lead.age],
                                ["Occupation", lead.occupation],
                                ["Work Location", lead.preferredLocation !== "-" ? lead.preferredLocation : "-"],
                                ["Funding Source", fundingForDrawer(lead)],
                                ["Income", "-"],
                              ] as const
                            ).map(([k, v]) => (
                              <div key={k} className="pb-4">
                                <div className="text-xs font-normal" style={{ color: "rgb(126, 122, 149)" }}>
                                  {k}
                                </div>
                                <div className="mt-1 text-sm font-medium" style={{ color: "rgb(31, 23, 80)" }}>
                                  {v}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div
                          className="flex flex-col rounded-2xl p-4"
                          style={{ backgroundColor: "rgb(241, 243, 252)" }}
                        >
                          <div className="mb-3 flex flex-row">
                            <Image src="/assets/images/EngagementMetric.svg" alt="" width={25} height={25} />
                            <h3 className="ml-2 text-base font-semibold" style={{ color: "rgb(31, 23, 80)" }}>
                              Engagement Metrics
                            </h3>
                          </div>
                          <div className="ml-8 flex-1 rounded-xl">
                            <div className="text-xs font-normal" style={{ color: "rgb(126, 122, 149)" }}>
                              No preferences added yet
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : detailTab === 2 ? (
                <LeadJourneyPanel lead={lead} variant="full" showFilters collapsibleDates />
              ) : detailTab === 3 ? (
                <LeadOverviewPanel lead={lead} onPatchLead={onLeadPatch} />
              ) : detailTab === 4 ? (
                <LeadStageChangeForm
                  key={lead.id}
                  lead={lead}
                  initialStage={lead.stage}
                  onCancel={() => setDetailTab(0)}
                  onSave={(stage) => {
                    patchStage(stage);
                    setDetailTab(0);
                  }}
                />
              ) : (
                <div className="py-8 text-center text-sm" style={{ color: "rgb(126, 122, 149)" }}>
                  {LEAD_DETAIL_TABS[detailTab]} — content placeholder
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
