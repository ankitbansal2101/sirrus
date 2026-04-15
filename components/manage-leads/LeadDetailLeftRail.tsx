"use client";

import Image from "next/image";
import { LeadTempBadge } from "@/lib/lead-temp-ring";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import { stageBg } from "@/lib/leads-sample-data";
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
  const fieldIds = summaryFieldIds ?? persistedIds;

  return (
    <aside
      className="flex h-full min-h-0 w-full min-w-0 flex-col bg-gradient-to-b from-[#f8f9fd] via-[#f4f5fa] to-[#eceef6]"
      aria-label="Lead summary"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pt-4 pb-3 [scrollbar-width:thin]">
        <div className="shrink-0 rounded-2xl border border-slate-200/40 bg-white/95 p-4 shadow-[0_2px_16px_-6px_rgba(31,23,80,0.08)] backdrop-blur-sm">
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
                  className="inline-flex items-center rounded-lg px-2.5 py-1 font-outfit text-xs font-semibold text-[#1F1750] ring-1 ring-black/[0.04]"
                  style={{ backgroundColor: stageBg(lead.stage) }}
                >
                  {lead.stage}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-2 font-outfit text-xs font-semibold text-[#1F1750] shadow-sm transition-colors hover:border-[#34369C]/25 hover:bg-slate-50/80 min-[380px]:flex-none min-[380px]:px-3"
          >
            <span className="relative block h-4 w-4 shrink-0">
              <Image src="/assets/images/call.svg" alt="" fill className="object-contain" sizes="16px" />
            </span>
            Call
          </button>
          <button
            type="button"
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-2 font-outfit text-xs font-semibold text-[#1F1750] shadow-sm transition-colors hover:border-[#34369C]/25 hover:bg-slate-50/80 min-[380px]:flex-none min-[380px]:px-3"
          >
            <span className="relative block h-4 w-4 shrink-0">
              <Image src="/assets/images/whatsApp.svg" alt="" fill className="object-contain" sizes="16px" />
            </span>
            Chat
          </button>
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-2 font-outfit text-xs font-semibold text-[#1F1750] shadow-sm transition-colors hover:border-[#34369C]/25 hover:bg-slate-50/80 min-[380px]:w-auto min-[380px]:px-3"
          >
            <span className="relative block h-4 w-4 shrink-0">
              <Image src="/assets/images/fe_comment.svg" alt="" fill className="object-contain" sizes="16px" />
            </span>
            Comment
          </button>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-white/85 shadow-[0_2px_14px_-6px_rgba(31,23,80,0.06)] backdrop-blur-sm">
          <LeftRailSummaryFields lead={lead} fieldIds={fieldIds} onPatchLead={onPatchLead} />
        </div>
      </div>
    </aside>
  );
}
