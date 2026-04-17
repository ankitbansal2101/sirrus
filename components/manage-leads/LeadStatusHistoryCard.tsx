"use client";

import {
  getStatusHistoryForLead,
  resolveSiteVisitTimelinePills,
  SITE_VISIT_SUB_PILL_STYLE,
  type LeadStatusHistoryEntry,
} from "@/lib/lead-status-history-data";
import { historyStatusPillFill, STAGE_PILL_BORDER, stageDotColor } from "@/lib/lead-stage-colors";
import type { LeadRow } from "@/lib/leads-sample-data";

const scrollStandalone = "min-h-[220px] max-h-[min(52vh,420px)] overflow-y-auto pr-0.5 [scrollbar-width:thin]";
const scrollEmbedded = "min-h-0 flex-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]";

const railInk = "rgb(52, 54, 156)";
const railLine = "rgb(214, 218, 232)";

/** Splits labels like "10 Apr 2026, 7:30 PM" into date + time; single-part dates stay in the date lane. */
function splitModifiedLabel(modifiedLabel: string): { date: string; time: string | null } {
  const idx = modifiedLabel.indexOf(", ");
  if (idx === -1) return { date: modifiedLabel.trim(), time: null };
  const date = modifiedLabel.slice(0, idx).trim();
  const time = modifiedLabel.slice(idx + 2).trim();
  return { date, time: time || null };
}

function HistoryRow({ entry, isLast }: { entry: LeadStatusHistoryEntry; isLast: boolean }) {
  const siteVisit = resolveSiteVisitTimelinePills(entry);
  const primaryFill = siteVisit ? stageDotColor("Site Visit") : historyStatusPillFill(entry.statusLabel);
  const { date, time } = splitModifiedLabel(entry.modifiedLabel);
  const by = entry.modifiedBy?.trim();
  const when = time ? `${date} ${time}` : date;
  const primaryLabel = siteVisit ? "Site Visit" : entry.statusLabel;
  const ariaStage = siteVisit
    ? `Site Visit, ${siteVisit.secondaryLabel}`
    : entry.statusLabel;
  const ariaLabel = by
    ? `Stage ${ariaStage}, ${when}, by ${by}`
    : `Stage ${ariaStage}, ${when}`;

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0 sm:gap-3.5" aria-label={ariaLabel}>
      <div className="relative flex w-4 shrink-0 flex-col items-center pt-0.5" aria-hidden>
        {!isLast ? (
          <span
            className="pointer-events-none absolute top-[11px] bottom-0 left-1/2 w-px -translate-x-1/2"
            style={{ backgroundColor: railLine }}
          />
        ) : null}
        <span
          className="relative z-[1] h-2.5 w-2.5 shrink-0 rounded-full border-2 bg-white shadow-[0_0_0_3px_rgba(52,54,156,0.1)]"
          style={{ borderColor: railInk }}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex w-fit max-w-full rounded-md border px-2.5 py-1 font-outfit text-[11px] font-bold tracking-wide ${
              siteVisit ? "normal-case tracking-tight text-[#1F1750]" : "uppercase"
            }`}
            style={{
              backgroundColor: primaryFill,
              color: "rgb(31, 23, 80)",
              borderColor: STAGE_PILL_BORDER,
            }}
          >
            {primaryLabel}
          </span>
          {siteVisit ? (
            <span
              className="inline-flex w-fit max-w-full rounded-md border px-2.5 py-1 font-outfit text-[11px] font-bold tracking-tight normal-case text-[#1F1750]"
              style={{
                backgroundColor: SITE_VISIT_SUB_PILL_STYLE[siteVisit.secondaryPill].backgroundColor,
                borderColor: STAGE_PILL_BORDER,
              }}
            >
              {siteVisit.secondaryLabel}
            </span>
          ) : null}
        </div>
        <p className="font-outfit text-[11px] leading-snug tracking-tight text-[#7a7694] sm:text-xs">
          <span className="font-semibold text-[#5c5878]">{date}</span>
          {time ? (
            <>
              <span className="mx-1.5 text-[#c4c0d4]" aria-hidden>
                ·
              </span>
              <span className="font-medium text-[#8b87a8]">{time}</span>
            </>
          ) : null}
        </p>
        {by ? (
          <p className="font-outfit text-[11px] leading-snug text-[#8b87a8] sm:text-xs">
            <span className="font-medium text-[#7a7694]">By </span>
            <span className="font-semibold text-[#1F1750]">{by}</span>
          </p>
        ) : null}
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
      className={`rounded-2xl border border-slate-200/50 bg-white shadow-[0_2px_16px_-6px_rgba(31,23,80,0.07)] ${
        embeddedInGrid ? "flex h-full min-h-[160px] min-w-0 flex-col p-3 sm:p-3.5 lg:min-h-0" : "p-5"
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
          <ul className="relative" aria-label="Status change timeline">
            {entries.map((e, i) => (
              <HistoryRow key={e.id} entry={e} isLast={i === entries.length - 1} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
