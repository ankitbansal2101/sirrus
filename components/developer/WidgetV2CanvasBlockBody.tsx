"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { LeadDetailLeftRail } from "@/components/manage-leads/LeadDetailLeftRail";
import { LeadStagePills } from "@/components/manage-leads/LeadStagePills";
import { LeadScoresAiSummaryStrip } from "@/components/manage-leads/LeadScoresAiSummaryStrip";
import { LeadStatusHistoryCard } from "@/components/manage-leads/LeadStatusHistoryCard";
import { getRemarksForLead, getTasksForLead } from "@/lib/lead-activity-data";
import { getAiSummaryStripInsightForLead } from "@/lib/lead-ai-summary-strip-data";
import { getJourneyForLead } from "@/lib/lead-journey-sample-data";
import type { JourneyEvent } from "@/lib/lead-journey-types";
import {
  formatJourneyFieldUpdateLine,
  sortJourneyDaysDesc,
  sortJourneyEventsWithinDayDesc,
} from "@/lib/lead-journey-utils";
import { normalizeToPipelineStageId } from "@/lib/lead-stage-options";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import { DEFAULT_TASK_WIDGET_COLUMNS } from "@/lib/widget-canvas-task-defaults";
import type { TaskWidgetColumnId } from "@/lib/widget-canvas-v2-types";

const card =
  "rounded-xl border border-slate-200/50 bg-white p-2 shadow-[0_2px_12px_-6px_rgba(31,23,80,0.06)] sm:p-2.5";

export type WidgetV2CanvasBlockOptions = {
  taskColumns?: TaskWidgetColumnId[];
  /** Blueprint-style stage preview: updates sample lead when user taps a pill (builder / preview). */
  onStagePreview?: (stage: string) => void;
};

function taskColumnLabel(id: TaskWidgetColumnId): string {
  if (id === "taskType") return "Task";
  if (id === "dueLabel") return "Due";
  return "Status";
}

function renderTaskCells(
  t: { taskType: string; dueLabel: string; status: string },
  cols: TaskWidgetColumnId[],
): ReactNode[] {
  return cols.map((c) => {
    const v = c === "taskType" ? t.taskType : c === "dueLabel" ? t.dueLabel : t.status;
    return (
      <td key={c} className="whitespace-nowrap py-1.5 pr-1.5 font-medium text-[#5c5878] sm:py-2 sm:pr-2">
        {c === "taskType" ? <span className="font-semibold text-[#1F1750]">{v}</span> : v}
      </td>
    );
  });
}

function journeyDaysForWidget(lead: LeadRow) {
  return sortJourneyDaysDesc(getJourneyForLead(lead)).map((d) => ({
    ...d,
    events: sortJourneyEventsWithinDayDesc(d.events),
  }));
}

function flattenJourneyCalls(lead: LeadRow) {
  const days = journeyDaysForWidget(lead);
  const rows: { day: string; durationLabel: string; remarks: string }[] = [];
  for (const d of days) {
    for (const ev of d.events) {
      if (ev.type === "callFeedback") {
        rows.push({
          day: d.dateLabel,
          durationLabel: ev.durationLabel,
          remarks: ev.remarks || "—",
        });
      }
    }
  }
  return rows;
}

function flattenJourneyTimeline(lead: LeadRow, max = 14): string[] {
  const days = journeyDaysForWidget(lead);
  const lines: string[] = [];
  for (const d of days) {
    for (const ev of d.events) {
      if (lines.length >= max) return lines;
      lines.push(formatJourneyLine(d.dateLabel, ev));
    }
  }
  return lines;
}

function formatJourneyLine(dateLabel: string, ev: JourneyEvent): string {
  if (ev.type === "remark") return `${dateLabel} · ${ev.text}`;
  if (ev.type === "fieldUpdate")
    return `${dateLabel} · ${formatJourneyFieldUpdateLine(ev.field, ev.oldValue, ev.newValue)}`;
  if (ev.type === "callFeedback") return `${dateLabel} · ${ev.durationLabel} · ${ev.remarks || "—"}`;
  if (ev.type === "comment") return `${dateLabel} · ${ev.author}: ${ev.body ?? ev.timeLabel}`;
  if (ev.type === "aiSummary") return `${dateLabel} · AI summary`;
  if (ev.type === "booking") return `${dateLabel} · Booking`;
  if (ev.type === "structured") return `${dateLabel} · ${ev.headline}`;
  return `${dateLabel} · Activity`;
}

/** Live sample UI inside a V2 canvas block — mirrors configurator / lead detail data. */
export function WidgetV2CanvasBlockBody({
  kind,
  lead,
  leftRailFieldIds,
  options,
}: {
  kind: string;
  lead: LeadRow;
  /** V2 left-rail summary fields; only used when `kind === "lead-details"`. */
  leftRailFieldIds: LeftRailFieldId[];
  options?: WidgetV2CanvasBlockOptions;
}) {
  const taskCols = options?.taskColumns?.length ? options.taskColumns : DEFAULT_TASK_WIDGET_COLUMNS;

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
          <LeadScoresAiSummaryStrip insight={getAiSummaryStripInsightForLead(lead)} sections="scores" />
        </div>
      );

    case "ai-summary":
      return (
        <div className="min-h-0 min-w-0 w-full max-w-full flex-1 overflow-auto p-1.5 [scrollbar-width:thin]">
          <LeadScoresAiSummaryStrip insight={getAiSummaryStripInsightForLead(lead)} sections="summary" />
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
                  <thead>
                    <tr className="border-b border-slate-100/90 text-[10px] font-semibold tracking-wide text-[#8b87a8]">
                      {taskCols.map((c) => (
                        <th key={c} className="py-1 pr-1.5 text-left font-outfit sm:pr-2">
                          {taskColumnLabel(c)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t, i) => (
                      <tr key={t.id} className={`align-middle ${i > 0 ? "border-t border-slate-100/90" : ""}`}>
                        {renderTaskCells(t, taskCols)}
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

    case "calls": {
      const rows = flattenJourneyCalls(lead);
      return (
        <div className={`${card} mx-1 mb-1 mt-0.5 flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col`}>
          <h3 className="mb-1.5 shrink-0 border-b border-slate-100 pb-1 font-outfit text-[11px] font-semibold text-[#1F1750]">
            Calls <span className="font-normal text-[#8b87a8]">({rows.length})</span>
          </h3>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
            {rows.length === 0 ? (
              <p className="py-6 text-center font-outfit text-xs text-[#8b87a8]">No calls in journey sample.</p>
            ) : (
              <table className="w-full min-w-0 table-auto border-collapse text-left font-outfit text-[11px] sm:text-[12px]">
                <thead>
                  <tr className="border-b border-slate-100/90 text-[10px] font-semibold text-[#8b87a8]">
                    <th className="py-1 pr-2">Day</th>
                    <th className="py-1 pr-2">Duration</th>
                    <th className="py-1">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={`${r.day}-${i}`} className={i > 0 ? "border-t border-slate-100/90" : ""}>
                      <td className="py-1.5 pr-2 font-medium text-[#5c5878]">{r.day}</td>
                      <td className="py-1.5 pr-2 tabular-nums text-[#5c5878]">{r.durationLabel}</td>
                      <td className="py-1.5 text-[#1F1750]">{r.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );
    }

    case "timeline": {
      const lines = flattenJourneyTimeline(lead);
      return (
        <div className={`${card} mx-1 mb-1 mt-0.5 flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col`}>
          <h3 className="mb-1.5 shrink-0 border-b border-slate-100 pb-1 font-outfit text-[11px] font-semibold text-[#1F1750]">
            Timeline
          </h3>
          <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
            {lines.length === 0 ? (
              <li className="py-6 text-center font-outfit text-xs text-[#8b87a8]">No journey events.</li>
            ) : (
              lines.map((line, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-slate-100/90 bg-white px-2 py-1.5 font-outfit text-[11px] leading-snug text-[#1F1750]"
                >
                  {line}
                </li>
              ))
            )}
          </ul>
        </div>
      );
    }

    case "change-stage":
      return (
        <div className="mx-1 mb-1 mt-0.5 flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-auto p-1.5 [scrollbar-width:thin]">
          <p className="font-outfit text-[10px] leading-relaxed text-[#8b87a8]">
            Current: <span className="font-semibold text-[#5c5878]">{lead.stage}</span>
            {options?.onStagePreview ? (
              <span className="block pt-0.5">Tap a stage to preview (blueprint-style).</span>
            ) : null}
          </p>
          <LeadStagePills
            currentStage={normalizeToPipelineStageId(lead.stage)}
            onSelect={(s) => options?.onStagePreview?.(s)}
            showHeading={false}
            density="compact"
            className="min-w-0"
          />
        </div>
      );

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
                      <p className="mt-0.5 font-outfit text-[9px] text-[#8b87a8]">
                        {r.timeLabel} · {r.author}
                      </p>
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
