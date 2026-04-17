"use client";

import Image from "next/image";
import { useMemo } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { LeadTempBadge } from "@/lib/lead-temp-ring";
import { DEFAULT_LEFT_RAIL_FIELD_ORDER, type LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import { STAGE_PILL_BORDER, stageDotColor } from "@/lib/lead-stage-colors";
import { LeftRailSummaryFields } from "./LeftRailSummaryFields";
import { useLeftRailFieldConfig } from "./useLeftRailFieldConfig";

export function LeadDetailLeftRail({
  lead,
  onEditLead,
  onPatchLead,
  /** When set, summary rows use this list (live admin preview). When unset, uses saved layout from localStorage. */
  summaryFieldIds,
}: {
  lead: LeadRow;
  onEditLead?: () => void;
  onPatchLead?: (patch: Partial<LeadRow>) => void;
  summaryFieldIds?: LeftRailFieldId[];
}) {
  const { orderedVisibleIds: persistedIds } = useLeftRailFieldConfig();
  /** Live preview passes `summaryFieldIds` explicitly (can be empty). Drawer uses persisted config; if everything is hidden, fall back so the rail is never blank by accident. */
  const fieldIds = useMemo(() => {
    if (summaryFieldIds !== undefined) return summaryFieldIds;
    if (persistedIds.length > 0) return persistedIds;
    return [...DEFAULT_LEFT_RAIL_FIELD_ORDER];
  }, [summaryFieldIds, persistedIds]);

  return (
    <aside
      className="w-full min-w-0 bg-gradient-to-b from-[#f8f9fd] via-[#f4f5fa] to-[#eceef6]"
      aria-label="Lead summary"
    >
      <div className="px-3 pt-4 pb-3">
        <div className="rounded-2xl border border-slate-200/40 bg-white/95 p-4 shadow-[0_2px_16px_-6px_rgba(31,23,80,0.08)] backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <LeadTempBadge temp={lead.temp} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="min-w-0 flex-1 font-outfit text-[17px] leading-tight font-semibold tracking-tight text-[#1F1750]">
                  {lead.name}
                </h2>
                <button
                  type="button"
                  onClick={() => onEditLead?.()}
                  className="mt-0.5 inline-flex shrink-0 items-center gap-0.5 rounded-md border border-[#34369C]/25 bg-white px-1.5 py-0.5 font-outfit text-[10px] font-semibold tracking-wide text-[#34369C] shadow-sm transition-colors hover:bg-[#f8f9ff]"
                  aria-label="Edit lead form"
                >
                  <Image src="/assets/images/editBluePencilIcon.svg" alt="" width={11} height={11} className="shrink-0" />
                  Edit
                </button>
              </div>
              <p className="mt-1 font-outfit text-xs tabular-nums tracking-wide text-[#8b87a8]">{lead.leadId}</p>
              <div className="mt-3">
                <span
                  className="inline-flex min-w-0 max-w-full cursor-default items-center justify-center rounded-md border px-3 py-1.5 font-outfit text-sm font-semibold"
                  style={{
                    backgroundColor: stageDotColor(lead.stage),
                    borderColor: STAGE_PILL_BORDER,
                    color: "rgb(31, 23, 80)",
                  }}
                >
                  {lead.stage}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="my-4 flex shrink-0 justify-between">
          <div className="flex flex-row items-center gap-4">
            <button
              type="button"
              className="relative flex w-fit cursor-pointer flex-row items-center overflow-visible rounded-xl border border-solid pt-2 pb-2 pl-2.5 pr-3 font-outfit transition-opacity hover:opacity-95 active:opacity-90 h-9"
              style={{
                backgroundColor: "rgb(229, 230, 241)",
                borderColor: "rgb(205, 205, 220)",
              }}
            >
              <span className="relative h-4 w-4 shrink-0">
                <Image src="/assets/images/call.svg" alt="Call" fill className="object-contain" sizes="16px" />
              </span>
              <span className="ml-2 text-[0.75rem]" style={{ color: "rgb(31, 23, 80)" }}>
                Call
              </span>
            </button>
            <button
              type="button"
              aria-label="Chat on WhatsApp"
              className="relative flex w-fit cursor-pointer flex-row items-center overflow-visible rounded-xl border border-solid pt-2 pb-2 pl-2.5 pr-3 font-outfit transition-opacity hover:opacity-95 active:opacity-90 h-9"
              style={{
                backgroundColor: "rgb(229, 230, 241)",
                borderColor: "rgb(205, 205, 220)",
              }}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
                <FaWhatsapp size={16} style={{ color: "#25D366" }} />
              </span>
              <span className="ml-2 text-[0.75rem]" style={{ color: "rgb(31, 23, 80)" }}>
                Chat
              </span>
            </button>
            <button
              type="button"
              className="relative flex w-fit cursor-pointer flex-row items-center overflow-visible rounded-xl border border-solid pt-2 pb-2 pl-2.5 pr-3 font-outfit transition-opacity hover:opacity-95 active:opacity-90 h-9"
              style={{
                backgroundColor: "rgb(229, 230, 241)",
                borderColor: "rgb(205, 205, 220)",
              }}
            >
              <span className="relative h-4 w-4 shrink-0">
                <Image src="/assets/images/fe_comment.svg" alt="Add comment" fill className="object-contain" sizes="16px" />
              </span>
              <span className="ml-2 text-[0.75rem]" style={{ color: "rgb(31, 23, 80)" }}>
                Add comment
              </span>
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200/50 bg-white/85 shadow-[0_2px_14px_-6px_rgba(31,23,80,0.06)] backdrop-blur-sm">
          <LeftRailSummaryFields lead={lead} fieldIds={fieldIds} onPatchLead={onPatchLead} />
        </div>
      </div>
    </aside>
  );
}
