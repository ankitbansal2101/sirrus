"use client";

import {
  getStatusHistoryForLead,
  STATUS_HISTORY_PILL_STYLES,
  type LeadStatusHistoryEntry,
} from "@/lib/lead-status-history-data";
import type { LeadRow } from "@/lib/leads-sample-data";

const scrollStandalone = "min-h-[220px] max-h-[min(52vh,420px)] overflow-y-auto pr-1 [scrollbar-width:thin]";
const scrollEmbedded = "min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]";

function HistoryRow({ entry }: { entry: LeadStatusHistoryEntry }) {
  const s = STATUS_HISTORY_PILL_STYLES[entry.tone];

  return (
    <li className="border-b border-slate-100/90 py-2.5 last:border-b-0">
      <span
        className="inline-block rounded-md border px-2.5 py-1 font-outfit text-[11px] font-bold tracking-wide uppercase"
        style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
      >
        {entry.statusLabel}
      </span>
      <p className="mt-1.5 font-outfit text-[11px] text-[#8b87a8] sm:text-xs">
        <span className="font-semibold text-[#5c5878]">Modified</span> {entry.modifiedLabel}
        {entry.modifiedBy ? (
          <>
            {" "}
            · <span className="text-[#1F1750]/80">{entry.modifiedBy}</span>
          </>
        ) : null}
      </p>
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
      className={`rounded-2xl border border-slate-200/50 bg-white shadow-[0_2px_16px_-6px_rgba(31,23,80,0.07)] ${
        embeddedInGrid ? "flex h-full min-h-[180px] min-w-0 flex-col p-4 lg:min-h-0" : "p-5"
      } ${className}`}
    >
      <div className="mb-2 shrink-0 border-b border-slate-100 pb-2">
        <h3 className="font-outfit text-xs font-semibold tracking-tight text-[#1F1750] sm:text-sm">
          Lead status history{" "}
          <span className="font-normal text-[#8b87a8]">({entries.length})</span>
        </h3>
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
