"use client";

import Image from "next/image";
import {
  getOpenTasksForLead,
  getRemarksForLead,
  type LeadTaskStatus,
} from "@/lib/lead-activity-data";
import type { LeadRow } from "@/lib/leads-sample-data";
import { MdAdd } from "react-icons/md";
import { LeadStatusHistoryCard } from "./LeadStatusHistoryCard";

const card =
  "rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_8px_-2px_rgba(31,23,80,0.06)]";
/** Scroll region inside a flex column card (grid row). */
const scrollFill = "min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]";

function statusPillStyle(status: LeadTaskStatus): { bg: string; color: string } {
  if (status === "Overdue") return { bg: "rgb(255, 236, 236)", color: "rgb(198, 40, 40)" };
  return { bg: "rgb(232, 245, 233)", color: "rgb(46, 125, 50)" };
}

const columnCard = `${card} flex min-h-[220px] min-w-0 flex-col lg:h-full lg:min-h-0`;

export function LeadActivityHub({ lead }: { lead: LeadRow }) {
  const remarks = getRemarksForLead(lead);
  const tasks = getOpenTasksForLead(lead);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-3 lg:grid-rows-1 lg:items-stretch lg:gap-5 [&>*]:min-h-0 [&>*]:min-w-0 lg:[&>*]:h-full">
        <LeadStatusHistoryCard lead={lead} embeddedInGrid />

        <section className={columnCard}>
          <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-2">
            <h3 className="font-outfit text-sm font-semibold tracking-tight text-[#1F1750]">
              Remarks <span className="font-normal text-[#8b87a8]">({remarks.length})</span>
            </h3>
            <span className="font-outfit text-xs text-[#8b87a8]">Recent first</span>
          </div>
          <label className="sr-only" htmlFor={`note-${lead.id}`}>
            Add a note
          </label>
          <textarea
            id={`note-${lead.id}`}
            rows={2}
            placeholder="Add a note…"
            className="mb-4 w-full shrink-0 resize-none rounded-xl border border-slate-200/80 bg-[#f8f9fc] px-3 py-2.5 font-outfit text-sm text-[#1F1750] placeholder:text-[#a8a4b8] transition-colors focus:border-[#34369C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#34369C]/15"
          />
          <div className={scrollFill}>
            {remarks.length === 0 ? (
              <p className="py-8 text-center font-outfit text-sm text-[#8b87a8]">No remarks yet.</p>
            ) : (
              <ul className="space-y-2">
                {remarks.map((r) => (
                  <li
                    key={r.id}
                    className="flex gap-3 rounded-xl border border-slate-100 bg-[#f6f7fc] px-3 py-3 transition-colors hover:border-slate-200/80"
                  >
                    <Image
                      src="/assets/images/userPlaceholder.svg"
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-outfit text-sm leading-snug text-[#1F1750]">{r.text}</p>
                      <p className="mt-1.5 font-outfit text-xs text-[#8b87a8]">
                        {lead.name} · {r.timeLabel} · {r.author}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={columnCard}>
          <div className="mb-4 flex shrink-0 items-center justify-between">
            <h3 className="font-outfit text-sm font-semibold tracking-tight text-[#1F1750]">
              Open tasks <span className="font-normal text-[#8b87a8]">({tasks.length})</span>
            </h3>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e0e3ee] bg-[#f4f5fc] text-[#34369C] transition-colors hover:border-[#34369C]/30 hover:bg-[#eceefe]"
              aria-label="Add task"
            >
              <MdAdd size={22} />
            </button>
          </div>
          <div className={scrollFill}>
            {tasks.length === 0 ? (
              <p className="py-8 text-center font-outfit text-sm text-[#8b87a8]">No records found</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => {
                  const st = statusPillStyle(t.status);
                  return (
                    <li
                      key={t.id}
                      className="rounded-xl border border-slate-100 bg-[#fafbff] px-3 py-3 transition-colors hover:border-slate-200/80"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <span className="min-w-0 font-outfit text-sm font-medium text-[#1F1750]">{t.title}</span>
                        <span
                          className="shrink-0 rounded-lg px-2 py-0.5 font-outfit text-xs font-semibold"
                          style={{ backgroundColor: st.bg, color: st.color }}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-outfit text-xs text-[#8b87a8]">
                        <span>
                          <span className="font-semibold text-[#5c5878]">Type</span> · {t.taskType}
                        </span>
                        <span>
                          <span className="font-semibold text-[#5c5878]">Due</span> · {t.dueLabel}
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
