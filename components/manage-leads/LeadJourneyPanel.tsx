"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getJourneyForLead } from "@/lib/lead-journey-sample-data";
import {
  filterDaysByRecency,
  filterDaysBySearch,
  type JourneyRecency,
  parseJourneyDateLabel,
  sortJourneyDaysDesc,
} from "@/lib/lead-journey-utils";
import type { LeadRow } from "@/lib/leads-sample-data";
import { JourneyZohoTimelineDay } from "@/components/manage-leads/journey/JourneyZohoTimeline";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

const RECENCY_OPTIONS: { id: JourneyRecency; label: string }[] = [
  { id: "all", label: "All dates" },
  { id: "30d", label: "Last 30 days" },
  { id: "7d", label: "Last 7 days" },
];

export type LeadJourneyPanelProps = {
  lead: LeadRow;
  /** Tighter vertical rhythm for embedded Overview hub. */
  variant?: "full" | "compact";
  showFilters?: boolean;
  collapsibleDates?: boolean;
  /** Optional scroll container (e.g. max height inside Overview). */
  scrollClassName?: string;
};

export function LeadJourneyPanel({
  lead,
  variant = "full",
  showFilters = true,
  collapsibleDates = true,
  scrollClassName,
}: LeadJourneyPanelProps) {
  const daysRaw = useMemo(() => getJourneyForLead(lead), [lead]);
  const [recency, setRecency] = useState<JourneyRecency>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [timelineRowOpen, setTimelineRowOpen] = useState<Record<string, boolean>>({});

  const recencyAnchorMs = useMemo(() => {
    let max = 0;
    for (const d of daysRaw) {
      const t = parseJourneyDateLabel(d.dateLabel);
      if (t != null && t > max) max = t;
    }
    return max > 0 ? max : Date.now();
  }, [daysRaw]);

  const daysPrepared = useMemo(() => {
    const sorted = sortJourneyDaysDesc(daysRaw);
    let d = filterDaysByRecency(sorted, recency, recencyAnchorMs);
    d = filterDaysBySearch(d, search);
    return d;
  }, [daysRaw, recency, search, recencyAnchorMs]);

  const firstDate = daysPrepared[0]?.dateLabel;
  useEffect(() => {
    if (!collapsibleDates) return;
    const fd = daysPrepared[0]?.dateLabel;
    queueMicrotask(() => {
      setExpanded(fd ? { [fd]: true } : {});
      setTimelineRowOpen({});
    });
  }, [collapsibleDates, lead.id, recency, search, daysPrepared]);

  const toggleDate = useCallback((label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const expandAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    for (const d of daysPrepared) all[d.dateLabel] = true;
    setExpanded(all);
  }, [daysPrepared]);

  const collapseAll = useCallback(() => {
    const one: Record<string, boolean> = {};
    if (firstDate) one[firstDate] = true;
    setExpanded(one);
  }, [firstDate]);

  const toggleTimelineRow = useCallback((key: string) => {
    setTimelineRowOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const compact = variant === "compact";
  const dateMb = compact ? "mb-2" : "mb-3";
  const dateText = compact ? "text-[13px]" : "text-[14px]";

  if (daysRaw.length === 0) {
    return (
      <div className="py-12 text-center font-outfit text-sm" style={{ color: "rgb(126, 122, 149)" }}>
        No journey events for this lead yet.
      </div>
    );
  }

  const inner = (
    <div className="relative">
      {showFilters ? (
        <div className="sticky top-0 z-10 mb-5 rounded-xl border border-slate-200/80 bg-white/95 px-3 py-3 shadow-sm backdrop-blur-md">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <h2 className="shrink-0 font-outfit text-base font-semibold tracking-tight text-slate-900">Timeline History</h2>
              <div className="min-w-0 flex-1 sm:min-w-[12rem] sm:max-w-md">
                <label htmlFor={`journey-search-${lead.id}`} className="sr-only">
                  Search journey
                </label>
                <input
                  id={`journey-search-${lead.id}`}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 font-outfit text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300/40"
                />
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {RECENCY_OPTIONS.map((opt) => {
                  const active = recency === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRecency(opt.id)}
                      className={`rounded-full px-3 py-1.5 font-outfit text-[12px] font-medium transition-colors ${
                        active ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
              {collapsibleDates ? (
                <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-2 sm:ml-auto sm:border-t-0 sm:pt-0">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="font-outfit text-xs font-medium text-slate-700 underline decoration-dotted underline-offset-2"
                  >
                    Expand all dates
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="font-outfit text-xs font-medium text-slate-500 underline decoration-dotted underline-offset-2"
                  >
                    Collapse to latest day
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {daysPrepared.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
          <p className="font-outfit text-sm" style={{ color: "rgb(126, 122, 149)" }}>
            {search.trim() ? "No journey entries match your search." : "No events in the selected date range."}
          </p>
          {search.trim() ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="mt-2 font-outfit text-xs font-semibold text-slate-700 underline"
            >
              Clear search
            </button>
          ) : null}
        </div>
      ) : null}

      {daysPrepared.map((day) => {
        const open = collapsibleDates ? (expanded[day.dateLabel] ?? false) : true;
        const count = day.events.length;
        return (
          <section key={day.dateLabel} className="relative mb-6 last:mb-2">
            {collapsibleDates ? (
              <button
                type="button"
                onClick={() => toggleDate(day.dateLabel)}
                className={`${dateMb} inline-flex max-w-full items-center gap-2 rounded-lg border border-transparent px-1 py-1.5 text-left transition-colors hover:bg-slate-50/90`}
              >
                <span
                  className={`inline-flex rounded-lg bg-slate-100 px-3 py-1.5 font-outfit font-medium text-slate-700 shadow-sm ${dateText}`}
                >
                  {day.dateLabel}
                </span>
                <span className="font-outfit text-[11px] font-normal text-slate-400">
                  · {count} {count === 1 ? "entry" : "entries"}
                </span>
                <span className="shrink-0 text-slate-500" aria-hidden>
                  {open ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
                </span>
              </button>
            ) : (
              <div className={`${dateMb} flex max-w-3xl flex-wrap items-center gap-2`}>
                <span
                  className={`inline-flex rounded-lg bg-slate-100 px-3 py-1.5 font-outfit font-medium text-slate-700 shadow-sm ${dateText}`}
                >
                  {day.dateLabel}
                </span>
                <span className="font-outfit text-[11px] font-normal text-slate-400">
                  · {count} {count === 1 ? "entry" : "entries"}
                </span>
              </div>
            )}
            {open ? (
              <JourneyZohoTimelineDay
                dateLabel={day.dateLabel}
                events={day.events}
                compact={compact}
                expandedRows={timelineRowOpen}
                onToggleRow={toggleTimelineRow}
              />
            ) : null}
          </section>
        );
      })}
    </div>
  );

  if (scrollClassName) {
    return <div className={scrollClassName}>{inner}</div>;
  }
  return inner;
}
