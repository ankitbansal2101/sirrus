"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useClientMounted } from "@/lib/use-client-mounted";
import type { LeadRow } from "@/lib/leads-sample-data";
import { LeadActivityHub } from "./LeadActivityHub";
import { LeadDetailLeftRail } from "./LeadDetailLeftRail";
import { LeadDetailMobileBar } from "./LeadDetailMobileBar";
import { LeadDetailProjectStrip } from "./LeadDetailProjectStrip";
import { LeadJourneyPanel } from "./LeadJourneyPanel";
import { LeadOverviewPanel } from "./LeadOverviewPanel";
import { LEAD_DETAIL_TABS } from "@/lib/lead-detail-tabs";
import { LeadStageChangeForm } from "./LeadStageChangeForm";

function fundingForDrawer(lead: LeadRow) {
  if (lead.drawerFundingSource) return lead.drawerFundingSource;
  return lead.funding !== "-" ? lead.funding : "-";
}

export function LeadDetailDrawer({
  lead,
  onClose,
  onStageChange,
  onRequestEditLeadForm,
  onPatchLead,
}: {
  lead: LeadRow | null;
  onClose: () => void;
  onStageChange?: (stage: string) => void;
  /** Opens the lead form overlay prepopulated for the current lead (e.g. from Lead Overview). */
  onRequestEditLeadForm?: () => void;
  /** Merge partial updates into the selected lead (inline edits in drawer / overview). */
  onPatchLead?: (patch: Partial<LeadRow>) => void;
}) {
  const mounted = useClientMounted();
  const [detailTab, setDetailTab] = useState(0);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!lead) return;
    window.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [lead, handleKey]);

  if (!mounted || !lead) return null;

  const patchStage = onStageChange ?? (() => {});

  return createPortal(
    <div
      id="root-modal"
      className="fixed inset-0 z-[100] flex h-full w-full flex-col bg-[#e8ebf4] md:flex-row"
      role="presentation"
    >
      <aside className="relative hidden min-h-0 w-[300px] shrink-0 self-stretch overflow-hidden shadow-[6px_0_40px_-12px_rgba(31,23,80,0.14)] md:block lg:w-[352px]">
        <div className="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-width:thin]">
          <LeadDetailLeftRail lead={lead} onEditLead={onRequestEditLeadForm} onPatchLead={onPatchLead} />
        </div>
      </aside>

      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col border-[#d5d9e6] bg-[#eef1f8] md:border-l"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-detail-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 flex-col gap-1.5 border-b border-slate-200/70 bg-white px-4 py-2 md:px-5 md:py-2.5">
          <h2 id="lead-detail-title" className="sr-only">
            Lead details — {lead.name}, {lead.leadId}
          </h2>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <LeadDetailProjectStrip projectName={lead.project} />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="mt-0.5 shrink-0 rounded-full p-1.5 text-[#5c5878] transition-colors hover:bg-[#f0f2f8] hover:text-[#1F1750]"
            >
              <svg width="20" height="20" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path
                  d="M10.9688 3.21871C11.1933 2.99416 11.5567 2.99416 11.7813 3.21871C12.0056 3.44328 12.0057 3.80673 11.7813 4.03121L8.31251 7.49996L11.7813 10.9687L11.8555 11.0586C12.0026 11.2817 11.9777 11.5848 11.7813 11.7812C11.5849 11.9776 11.2818 12.0026 11.0586 11.8554L10.9688 11.7812L7.50001 8.31246L4.03126 11.7812C3.80677 12.0057 3.44332 12.0056 3.21876 11.7812C2.99421 11.5567 2.99421 11.1933 3.21876 10.9687L6.68751 7.49996L3.21876 4.03121L3.14454 3.94137C2.99723 3.71819 3.0223 3.41517 3.21876 3.21871C3.41522 3.02225 3.71823 2.99719 3.94141 3.14449L4.03126 3.21871L7.50001 6.68746L10.9688 3.21871Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          <div className="min-w-0 md:hidden">
            <span className="truncate font-outfit text-sm font-semibold text-[#1F1750]">{lead.name}</span>
            <span className="block truncate font-outfit text-xs" style={{ color: "rgb(126, 122, 149)" }}>
              {lead.leadId}
            </span>
          </div>
        </div>

        <LeadDetailMobileBar lead={lead} onEditLead={onRequestEditLeadForm} />

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
              detailTab === 0
                ? "flex min-h-0 flex-col overflow-y-auto overscroll-contain"
                : "overflow-y-auto"
            }`}
          >
            <div
              className={
                detailTab === 0
                  ? "flex min-h-0 flex-1 flex-col py-2 pl-3 pr-3 sm:py-3 sm:pl-4 sm:pr-4"
                  : detailTab === 2
                    ? "py-6 pl-4 pr-4 sm:pl-6 sm:pr-6"
                    : detailTab === 3
                      ? "p-0"
                      : "py-5 pl-4 pr-4 sm:pl-6 sm:pr-6"
              }
            >
              {detailTab === 0 ? (
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
                <LeadOverviewPanel lead={lead} onEditLead={onRequestEditLeadForm} onPatchLead={onPatchLead} />
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
    </div>,
    document.body,
  );
}
