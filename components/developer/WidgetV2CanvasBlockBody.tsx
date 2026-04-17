"use client";

import Image from "next/image";
import { LeadDetailLeftRail } from "@/components/manage-leads/LeadDetailLeftRail";
import { LeadScoresAiSummaryStrip } from "@/components/manage-leads/LeadScoresAiSummaryStrip";
import { LeadStatusHistoryCard } from "@/components/manage-leads/LeadStatusHistoryCard";
import { getRemarksForLead, getTasksForLead } from "@/lib/lead-activity-data";
import { getAiSummaryStripInsightForLead } from "@/lib/lead-ai-summary-strip-data";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";

const card =
  "rounded-xl border border-slate-200/50 bg-white p-2 shadow-[0_2px_12px_-6px_rgba(31,23,80,0.06)] sm:p-2.5";

/** Live sample UI inside a V2 canvas block — mirrors configurator / lead detail data. */
export function WidgetV2CanvasBlockBody({
  kind,
  lead,
  leftRailFieldIds,
}: {
  kind: string;
  lead: LeadRow;
  /** V2 left-rail summary fields; only used when `kind === "lead-details"`. */
  leftRailFieldIds: LeftRailFieldId[];
}) {
  switch (kind) {
    case "lead-details":
      return (
        <div className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-b-[10px] bg-[#e8ebf4]">
          <div className="absolute inset-0 overflow-x-hidden overflow-y-auto overscroll-y-contain [scrollbar-width:thin]">
            <LeadDetailLeftRail lead={lead} summaryFieldIds={leftRailFieldIds} />
          </div>
        </div>
      );

    case "pair":
      return (
        <div className="min-h-0 min-w-0 w-full max-w-full flex-1 overflow-auto p-1.5 [scrollbar-width:thin]">
          <LeadScoresAiSummaryStrip
            insight={getAiSummaryStripInsightForLead(lead)}
            sections="scores"
          />
        </div>
      );

    case "ai-summary":
      return (
        <div className="min-h-0 min-w-0 w-full max-w-full flex-1 overflow-auto p-1.5 [scrollbar-width:thin]">
          <LeadScoresAiSummaryStrip
            insight={getAiSummaryStripInsightForLead(lead)}
            sections="summary"
          />
        </div>
      );

    case "open-tasks": {
      const tasks = getTasksForLead(lead);
      return (
        <div className={`${card} mx-1 mb-1 mt-0.5 flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col`}>
          <h3 className="mb-1.5 shrink-0 border-b border-slate-100 pb-1 font-outfit text-[11px] font-semibold text-[#1F1750]">
            All tasks <span className="font-normal text-[#8b87a8]">({tasks.length})</span>
          </h3>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
            {tasks.length === 0 ? (
              <p className="py-6 text-center font-outfit text-xs text-[#8b87a8]">No tasks yet.</p>
            ) : (
              <div className="rounded-lg border border-slate-100/90 bg-white px-1.5 py-0.5 sm:px-2">
                <table className="w-full min-w-0 table-auto border-collapse text-left font-outfit text-[12px] sm:text-[13px]">
                  <tbody>
                    {tasks.map((t, i) => (
                      <tr
                        key={t.id}
                        className={`align-middle ${i > 0 ? "border-t border-slate-100/90" : ""}`}
                      >
                        <td className="py-1.5 pr-1.5 font-semibold whitespace-nowrap text-[#1F1750] sm:py-2 sm:pr-2">
                          {t.taskType}
                        </td>
                        <td className="whitespace-nowrap py-1.5 pr-1.5 font-medium tabular-nums text-[#5c5878] sm:py-2 sm:pr-2">
                          {t.dueLabel}
                        </td>
                        <td className="whitespace-nowrap py-1.5 font-medium text-[#5c5878] sm:py-2">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    case "notes": {
      const remarks = [...getRemarksForLead(lead)].sort((a, b) => b.sortAt - a.sortAt);
      return (
        <div className={`${card} mx-1 mb-1 mt-0.5 flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col`}>
          <h3 className="mb-1.5 shrink-0 border-b border-slate-100 pb-1 font-outfit text-[11px] font-semibold text-[#1F1750]">
            Remarks <span className="font-normal text-[#8b87a8]">({remarks.length})</span>
          </h3>
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
            {remarks.length === 0 ? (
              <p className="py-6 text-center font-outfit text-xs text-[#8b87a8]">No remarks yet.</p>
            ) : (
              <ul className="space-y-1">
                {remarks.map((r) => (
                  <li
                    key={r.id}
                    className="flex gap-1.5 rounded-lg border border-slate-100/90 bg-white px-2 py-1.5 shadow-[0_1px_2px_rgba(31,23,80,0.04)]"
                  >
                    <Image
                      src="/assets/images/userPlaceholder.svg"
                      alt=""
                      width={22}
                      height={22}
                      className="h-[22px] w-[22px] shrink-0 rounded-full object-cover ring-1 ring-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-outfit text-[11px] leading-snug text-[#1F1750]">{r.text}</p>
                      <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-1 gap-y-0.5">
                        <span className="font-outfit text-[9px] text-[#8b87a8]">
                          {r.timeLabel} · {r.author}
                        </span>
                        <span className="inline-flex max-w-[9rem] shrink-0 truncate rounded-full border border-[#34369C]/15 bg-[#f4f5ff] px-1 py-0.5 font-outfit text-[9px] font-medium text-[#34369C]">
                          {r.source}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
    }

    case "lead-status-history":
      return (
        <div className="mx-1 mb-1 mt-0.5 min-h-0 min-w-0 w-full max-w-full flex-1 overflow-auto rounded-b-[10px] px-0.5 [scrollbar-width:thin]">
          <LeadStatusHistoryCard lead={lead} embeddedInGrid className="shadow-none ring-0" />
        </div>
      );

    default:
      return (
        <div className="flex min-h-0 flex-1 items-center justify-center px-2 text-center font-outfit text-[10px] text-[#a8a4b8]">
          Unknown widget type.
        </div>
      );
  }
}
