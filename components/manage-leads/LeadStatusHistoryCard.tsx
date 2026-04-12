"use client";

import {
  getStatusHistoryForLead,
  STATUS_HISTORY_PILL_STYLES,
  type LeadStatusHistoryEntry,
} from "@/lib/lead-status-history-data";
import type { LeadRow } from "@/lib/leads-sample-data";
import { MdRefresh } from "react-icons/md";

const scrollStandalone = "min-h-[220px] max-h-[min(52vh,420px)] overflow-y-auto pr-1 [scrollbar-width:thin]";
const scrollEmbedded = "min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]";

function HistoryRow({ entry }: { entry: LeadStatusHistoryEntry }) {
  const s = STATUS_HISTORY_PILL_STYLES[entry.tone];
  const duration =
    entry.durationDays === null ? "—" : entry.durationDays === 0 ? "0" : String(entry.durationDays);

  return (
    <li className="border-b border-slate-100 py-3 last:border-b-0">
      <span
        className="inline-block rounded-md border px-2.5 py-1 font-outfit text-[11px] font-bold tracking-wide uppercase"
        style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
      >
        {entry.statusLabel}
      </span>
      <div className="mt-2.5 space-y-1 font-outfit text-xs text-[#8b87a8]">
        <p>
          <span className="font-semibold text-[#5c5878]">Duration (days)</span>{" "}
          <span className="tabular-nums">{duration}</span>
        </p>
        <p>
          <span className="font-semibold text-[#5c5878]">Modified</span> {entry.modifiedLabel}
          {entry.modifiedBy ? (
            <>
              {" "}
              · <span className="text-[#1F1750]/80">{entry.modifiedBy}</span>
            </>
          ) : null}
        </p>
      </div>
    </li>
  );
}

export function LeadStatusHistoryCard({
  lead,
  className = "",
  /** Stretch to grid row height; scroll area fills remaining space. */
  embeddedInGrid = false,
}: {
  lead: LeadRow;
  className?: string;
  embeddedInGrid?: boolean;
}) {
  const entries = getStatusHistoryForLead(lead);
  const scrollClass = embeddedInGrid ? scrollEmbedded : scrollStandalone;

  return (
    <section
      className={`rounded-xl border border-slate-200/60 bg-white p-5 shadow-[0_1px_8px_-2px_rgba(31,23,80,0.06)] ${
        embeddedInGrid ? "flex h-full min-h-[220px] min-w-0 flex-col lg:min-h-0" : ""
      } ${className}`}
    >
      <div className="mb-4 flex shrink-0 items-center justify-between gap-2">
        <h3 className="font-outfit text-sm font-semibold tracking-tight text-[#1F1750]">
          Lead status history{" "}
          <span className="font-normal text-[#8b87a8]">({entries.length})</span>
        </h3>
        <button
          type="button"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e0e3ee] bg-[#f4f5fc] text-[#5c5878] transition-colors hover:border-[#34369C]/25 hover:text-[#34369C]"
          aria-label="Refresh status history"
        >
          <MdRefresh size={20} />
        </button>
      </div>
      <div className={scrollClass}>
        {entries.length === 0 ? (
          <p className="py-8 text-center font-outfit text-sm text-[#8b87a8]">No status changes yet.</p>
        ) : (
          <ul>
            {entries.map((e) => (
              <HistoryRow key={e.id} entry={e} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
