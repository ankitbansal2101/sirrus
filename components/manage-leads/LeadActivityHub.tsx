"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  getOpenTasksForLead,
  getRemarksForLead,
  type LeadRemarkSource,
  type LeadTaskStatus,
} from "@/lib/lead-activity-data";
import { getAiSummaryStripInsightForLead } from "@/lib/lead-ai-summary-strip-data";
import type { LeadRow } from "@/lib/leads-sample-data";
import { MdFilterList } from "react-icons/md";
import { LeadScoresAiSummaryStrip } from "./LeadScoresAiSummaryStrip";
import { LeadStatusHistoryCard } from "./LeadStatusHistoryCard";

const card =
  "rounded-2xl border border-slate-200/50 bg-white p-3 shadow-[0_2px_16px_-6px_rgba(31,23,80,0.07)] sm:p-3.5";
/** Scroll region inside a flex column card (grid row). */
const scrollFill = "min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]";

function statusPillStyle(status: LeadTaskStatus): { bg: string; color: string } {
  if (status === "Overdue") return { bg: "rgb(255, 236, 236)", color: "rgb(198, 40, 40)" };
  return { bg: "rgb(232, 245, 233)", color: "rgb(46, 125, 50)" };
}

const columnCard = `${card} flex min-h-[160px] min-w-0 flex-col lg:h-full lg:min-h-0`;

type RemarkSortOrder = "recent-first" | "recent-last";

const REMARK_SOURCES: LeadRemarkSource[] = ["Call feedback form", "Comment", "Change Stage"];

function defaultRemarkSourceFilter(): Record<LeadRemarkSource, boolean> {
  return {
    "Call feedback form": true,
    Comment: true,
    "Change Stage": true,
  };
}

export function LeadActivityHub({ lead }: { lead: LeadRow }) {
  const remarks = getRemarksForLead(lead);
  const tasks = getOpenTasksForLead(lead);
  const [remarkSort, setRemarkSort] = useState<RemarkSortOrder>("recent-first");
  const [remarkSourceFilter, setRemarkSourceFilter] =
    useState<Record<LeadRemarkSource, boolean>>(defaultRemarkSourceFilter);

  const sortedRemarks = useMemo(() => {
    const next = remarks.filter((r) => remarkSourceFilter[r.source]);
    next.sort((a, b) =>
      remarkSort === "recent-first" ? b.sortAt - a.sortAt : a.sortAt - b.sortAt,
    );
    return next;
  }, [remarks, remarkSort, remarkSourceFilter]);

  const toggleRemarkSource = (source: LeadRemarkSource) => {
    setRemarkSourceFilter((prev) => ({ ...prev, [source]: !prev[source] }));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5 sm:gap-3">
      <LeadScoresAiSummaryStrip insight={getAiSummaryStripInsightForLead(lead)} />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5 sm:gap-3 lg:grid-rows-1 lg:grid-cols-[clamp(18.5rem,30vw,26rem)_minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch lg:gap-3 [&>*]:min-h-0 [&>*]:min-w-0 lg:[&>*]:h-full">
        <LeadStatusHistoryCard lead={lead} embeddedInGrid />

        <section className={columnCard}>
          <div className="mb-1.5 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
            <h3 className="font-outfit text-xs font-semibold tracking-tight text-[#1F1750] sm:text-sm">
              Remarks <span className="font-normal text-[#8b87a8]">({sortedRemarks.length})</span>
            </h3>
            <label className="flex items-center gap-1.5">
              <span className="sr-only">Sort remarks</span>
              <select
                value={remarkSort}
                onChange={(e) => setRemarkSort(e.target.value as RemarkSortOrder)}
                className="cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1 font-outfit text-[11px] font-medium text-[#1F1750] shadow-sm outline-none transition-colors hover:border-slate-300 hover:bg-slate-50/80 focus:border-[#34369C] focus:ring-1 focus:ring-[#34369C]/20 sm:text-xs"
              >
                <option value="recent-first">Recent first</option>
                <option value="recent-last">Recent last</option>
              </select>
            </label>
          </div>
          {remarks.length > 0 ? (
            <div className="mb-1.5 rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white px-2 py-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)]">
              <div className="flex flex-wrap items-center gap-1.5">
                <MdFilterList className="h-3.5 w-3.5 shrink-0 text-[#34369C]/45" aria-hidden />
                <span className="sr-only">Filter remarks by source</span>
                <div className="flex min-w-0 flex-1 flex-wrap gap-1" role="group" aria-label="Remark source filters">
                  {REMARK_SOURCES.map((src) => {
                    const on = remarkSourceFilter[src];
                    return (
                      <button
                        key={src}
                        type="button"
                        onClick={() => toggleRemarkSource(src)}
                        className={`rounded-full border px-2 py-0.5 font-outfit text-[10px] font-medium leading-tight transition-all sm:text-[11px] ${
                          on
                            ? "border-[#34369C]/30 bg-[#eceefe] text-[#2d2a68] shadow-sm"
                            : "border-slate-200/90 bg-white/80 text-[#7a7694] hover:border-slate-300 hover:text-[#1F1750]"
                        }`}
                        aria-pressed={on}
                      >
                        {src}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
          <label className="sr-only" htmlFor={`note-${lead.id}`}>
            Add a note
          </label>
          <textarea
            id={`note-${lead.id}`}
            rows={1}
            placeholder="Add a note…"
            className="mb-1.5 min-h-[2rem] w-full shrink-0 resize-y rounded-lg border border-slate-200/90 bg-slate-50/50 px-2 py-1 font-outfit text-xs leading-snug text-[#1F1750] placeholder:text-[#a8a4b8] transition-all focus:border-[#34369C]/40 focus:bg-white focus:shadow-[0_0_0_2px_rgba(52,54,156,0.08)] focus:outline-none sm:text-[13px]"
          />
          <div className={scrollFill}>
            {remarks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 py-10 text-center font-outfit text-sm text-[#8b87a8]">
                No remarks yet.
              </p>
            ) : sortedRemarks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 py-10 text-center font-outfit text-sm text-[#8b87a8]">
                No remarks match these filters.
              </p>
            ) : (
              <ul className="space-y-1">
                {sortedRemarks.map((r) => (
                  <li
                    key={r.id}
                    className="flex gap-1.5 rounded-lg border border-slate-100/90 bg-white px-2 py-1.5 shadow-[0_1px_2px_rgba(31,23,80,0.04)] transition-all hover:border-slate-200 hover:shadow-[0_3px_10px_-5px_rgba(31,23,80,0.08)]"
                  >
                    <Image
                      src="/assets/images/userPlaceholder.svg"
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-outfit text-[12px] leading-snug text-[#1F1750] sm:text-[13px] sm:leading-snug">
                        {r.text}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-1.5 gap-y-0.5">
                        <span className="min-w-0 font-outfit text-[10px] text-[#8b87a8] sm:text-[11px]">
                          {r.timeLabel} · {r.author}
                        </span>
                        <span className="inline-flex max-w-[min(100%,10rem)] shrink-0 items-center rounded-full border border-[#34369C]/15 bg-[#f4f5ff] px-1.5 py-0.5 font-outfit text-[10px] font-medium leading-tight text-[#34369C] sm:text-[11px]">
                          {r.source}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={columnCard}>
          <h3 className="mb-1.5 shrink-0 border-b border-slate-100 pb-1.5 font-outfit text-xs font-semibold tracking-tight text-[#1F1750] sm:text-sm">
            Open tasks <span className="font-normal text-[#8b87a8]">({tasks.length})</span>
          </h3>
          <div className={scrollFill}>
            {tasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 py-10 text-center font-outfit text-sm text-[#8b87a8]">
                No records found
              </p>
            ) : (
              <ul className="space-y-1">
                {tasks.map((t) => {
                  const st = statusPillStyle(t.status);
                  return (
                    <li
                      key={t.id}
                      className="rounded-lg border border-slate-100/90 bg-white px-2 py-1.5 shadow-[0_1px_2px_rgba(31,23,80,0.04)] transition-all hover:border-slate-200 hover:shadow-[0_3px_10px_-5px_rgba(31,23,80,0.08)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5 font-outfit text-[13px] sm:text-sm">
                          <span className="font-semibold text-[#1F1750]">{t.taskType}</span>
                          <span className="text-[#8b87a8]">
                            <span className="font-semibold text-[#5c5878]">Due</span> · {t.dueLabel}
                          </span>
                        </div>
                        <span
                          className="shrink-0 rounded-lg px-2.5 py-0.5 font-outfit text-xs font-semibold"
                          style={{ backgroundColor: st.bg, color: st.color }}
                        >
                          {t.status}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
