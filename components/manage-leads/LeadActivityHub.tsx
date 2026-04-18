"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getTasksForLead, getRemarksForLead, type LeadRemark } from "@/lib/lead-activity-data";
import { getAiSummaryStripInsightForLead } from "@/lib/lead-ai-summary-strip-data";
import type { LeadRow } from "@/lib/leads-sample-data";
import { MdArrowUpward } from "react-icons/md";
import { LeadScoresAiSummaryStrip } from "./LeadScoresAiSummaryStrip";
import { LeadStatusHistoryCard } from "./LeadStatusHistoryCard";

const card =
  "rounded-2xl border border-slate-200/50 bg-white p-2.5 shadow-[0_2px_16px_-6px_rgba(31,23,80,0.07)] sm:p-3";
/** Scroll region inside a flex column card (grid row). */
const scrollFill = "min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]";

const columnCard = `${card} flex min-h-[160px] min-w-0 flex-col lg:h-full lg:min-h-0`;

type RemarkSortOrder = "recent-first" | "recent-last";

function formatRemarkTimestamp(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function LeadActivityHub({ lead }: { lead: LeadRow }) {
  const seedRemarks = useMemo(() => getRemarksForLead(lead), [lead]);
  const tasks = getTasksForLead(lead);
  const [noteDraft, setNoteDraft] = useState("");
  const [localRemarks, setLocalRemarks] = useState<LeadRemark[]>([]);
  const [remarkSort, setRemarkSort] = useState<RemarkSortOrder>("recent-first");

  useEffect(() => {
    setLocalRemarks([]);
    setNoteDraft("");
  }, [lead.id]);

  const remarks = useMemo(() => [...localRemarks, ...seedRemarks], [localRemarks, seedRemarks]);

  const submitNote = useCallback(() => {
    const text = noteDraft.trim();
    if (!text) return;
    const now = Date.now();
    const author =
      lead.assignedDisplayName?.trim() ||
      lead.assignedTitle?.trim() ||
      lead.assigned?.trim() ||
      "You";
    setLocalRemarks((prev) => [
      {
        id: `note-local-${now}`,
        author,
        text,
        timeLabel: formatRemarkTimestamp(new Date(now)),
        source: "Comment",
        sortAt: now,
      },
      ...prev,
    ]);
    setNoteDraft("");
  }, [lead.assigned, lead.assignedDisplayName, lead.assignedTitle, noteDraft]);

  const sortedRemarks = useMemo(() => {
    const next = [...remarks];
    next.sort((a, b) =>
      remarkSort === "recent-first" ? b.sortAt - a.sortAt : a.sortAt - b.sortAt,
    );
    return next;
  }, [remarks, remarkSort]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5 sm:gap-3">
      <LeadScoresAiSummaryStrip insight={getAiSummaryStripInsightForLead(lead)} />
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2.5 sm:gap-3 lg:grid-rows-1 lg:grid-cols-[minmax(0,2.25fr)_minmax(0,2.85fr)_minmax(0,2.55fr)] lg:items-stretch lg:gap-3 [&>*]:min-h-0 [&>*]:min-w-0 lg:[&>*]:h-full">
        <LeadStatusHistoryCard lead={lead} embeddedInGrid />

        <section className={columnCard}>
          <div className="mb-1.5 flex min-w-0 shrink-0 flex-nowrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
            <h3 className="min-w-0 truncate font-outfit text-xs font-semibold tracking-tight text-[#1F1750] sm:text-sm">
              Remarks <span className="font-normal text-[#8b87a8]">({sortedRemarks.length})</span>
            </h3>
            <label className="flex shrink-0 items-center gap-1.5">
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
          <label className="sr-only" htmlFor={`remark-${lead.id}`}>
            Add a remark
          </label>
          <div className="relative mb-1.5 shrink-0">
            <textarea
              id={`remark-${lead.id}`}
              rows={2}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  submitNote();
                }
              }}
              placeholder="Add a remark"
              className={`min-h-[2.5rem] w-full resize-y rounded-lg border border-slate-200/90 bg-slate-50/50 py-1.5 pb-2 font-outfit text-xs leading-snug text-[#1F1750] placeholder:text-[#a8a4b8] transition-all focus:border-[#34369C]/40 focus:bg-white focus:shadow-[0_0_0_2px_rgba(52,54,156,0.08)] focus:outline-none sm:text-[13px] ${
                noteDraft.trim() ? "pl-2 pr-11" : "px-2"
              }`}
            />
            {noteDraft.trim() ? (
              <button
                type="button"
                onClick={submitNote}
                title="Send remark (Ctrl+Enter)"
                className="absolute top-1.5 right-1.5 z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#34369C] text-white shadow-md ring-2 ring-white transition hover:bg-[#2d308c] active:scale-[0.96]"
                aria-label="Send remark"
              >
                <MdArrowUpward className="h-[18px] w-[18px]" aria-hidden />
              </button>
            ) : null}
          </div>
          <div className={scrollFill}>
            {remarks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 py-10 text-center font-outfit text-sm text-[#8b87a8]">
                No remarks yet.
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
                      <p className="mt-1 min-w-0 truncate font-outfit text-[10px] text-[#8b87a8] sm:text-[11px]">
                        {r.timeLabel} · {r.author}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={columnCard}>
          <h3 className="mb-1.5 shrink-0 border-b border-slate-100 pb-1.5 font-outfit text-xs font-semibold tracking-tight text-[#1F1750] sm:text-sm">
            All tasks <span className="font-normal text-[#8b87a8]">({tasks.length})</span>
          </h3>
          <div className={`${scrollFill} min-w-0`}>
            {tasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/40 py-10 text-center font-outfit text-sm text-[#8b87a8]">
                No tasks yet.
              </p>
            ) : (
              <div className="rounded-xl border border-slate-100/90 bg-white px-2 py-0.5 shadow-[0_1px_2px_rgba(31,23,80,0.04)] sm:px-2.5">
                <table className="w-full min-w-0 table-auto border-collapse text-left font-outfit text-[13px] sm:text-sm">
                  <tbody>
                    {tasks.map((t, i) => (
                      <tr
                        key={t.id}
                        className={`align-middle transition-colors hover:bg-slate-50/60 ${i > 0 ? "border-t border-slate-100/90" : ""}`}
                      >
                        <td className="py-2 pr-2 font-semibold whitespace-nowrap text-[#1F1750]">
                          {t.taskType}
                        </td>
                        <td className="whitespace-nowrap py-2 pr-2 font-medium tabular-nums text-[#5c5878]">
                          {t.dueLabel}
                        </td>
                        <td className="whitespace-nowrap py-2 font-medium text-[#5c5878]">{t.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
