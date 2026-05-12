import type { JourneyDay, JourneyEvent } from "@/lib/lead-journey-types";
import { structuredTypeLabel } from "@/lib/lead-journey-structured-meta";

/** Display empty / placeholder field values like Zoho (“blank value”). */
export function fieldValueForZohoDisplay(v: string): string {
  const t = v.trim();
  if (!t || t === "—") return "blank value";
  return t;
}

/** Plain sentence for search, list rows, and non-rich UI (Zoho-style). */
export function formatJourneyFieldUpdateSentence(field: string, oldValue: string, newValue: string): string {
  const f = field.trim() || "Field";
  return `${f} was updated from ${fieldValueForZohoDisplay(oldValue)} to ${fieldValueForZohoDisplay(newValue)}`;
}

/** @deprecated Use {@link formatJourneyFieldUpdateSentence}; kept as alias for callers. */
export const formatJourneyFieldUpdateLine = formatJourneyFieldUpdateSentence;

/** Parse `DD/MM/YYYY` labels used in journey fixtures / prod copy. */
export function parseJourneyDateLabel(label: string): number | null {
  const m = label.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const y = parseInt(m[3], 10);
  const t = Date.UTC(y, mo, d, 12, 0, 0);
  return Number.isNaN(t) ? null : t;
}

export function sortJourneyDaysDesc(days: JourneyDay[]): JourneyDay[] {
  return [...days].sort((a, b) => {
    const ta = parseJourneyDateLabel(a.dateLabel) ?? 0;
    const tb = parseJourneyDateLabel(b.dateLabel) ?? 0;
    return tb - ta;
  });
}

/** Parse `h:mm AM/PM` (fixture / UI labels) to minutes from midnight for same-day ordering. */
export function parseJourneyTimeLabelToMinutes(label: string): number | null {
  const s = label.trim();
  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (h < 1 || h > 12 || mm > 59) return null;
  if (ap === "AM") {
    if (h === 12) h = 0;
  } else if (ap === "PM") {
    if (h !== 12) h += 12;
  } else return null;
  return h * 60 + mm;
}

function journeyEventTimeMinutes(ev: JourneyEvent): number | null {
  let raw: string | undefined;
  switch (ev.type) {
    case "note":
    case "fieldUpdate":
    case "booking":
    case "callFeedback":
    case "structured":
      raw = ev.timeLabel;
      break;
    case "aiSummary":
    case "comment":
      raw = ev.timeLabel;
      break;
    default:
      return null;
  }
  if (!raw?.trim()) return null;
  return parseJourneyTimeLabelToMinutes(raw);
}

/** Latest activity first within a single calendar day (uses `timeLabel` when present). */
export function sortJourneyEventsWithinDayDesc(events: JourneyEvent[]): JourneyEvent[] {
  const indexed = events.map((ev, index) => ({ ev, index }));
  indexed.sort((a, b) => {
    const ma = journeyEventTimeMinutes(a.ev);
    const mb = journeyEventTimeMinutes(b.ev);
    if (ma !== null && mb !== null && ma !== mb) return mb - ma;
    if (ma !== null && mb === null) return -1;
    if (ma === null && mb !== null) return 1;
    return b.index - a.index;
  });
  return indexed.map((x) => x.ev);
}

export type JourneyRecency = "all" | "7d" | "30d";

export function filterDaysByRecency(days: JourneyDay[], mode: JourneyRecency, anchorMs: number): JourneyDay[] {
  if (mode === "all") return days;
  const daysBack = mode === "7d" ? 7 : 30;
  const cutoff = anchorMs - daysBack * 24 * 60 * 60 * 1000;
  return days.filter((d) => (parseJourneyDateLabel(d.dateLabel) ?? 0) >= cutoff);
}

/** One-line preview for filters / digest rows. */
export function journeyEventPreview(ev: JourneyEvent): string {
  switch (ev.type) {
    case "note":
      return ev.text;
    case "fieldUpdate": {
      const base = formatJourneyFieldUpdateSentence(ev.field, ev.oldValue, ev.newValue);
      if (!ev.blueprintRows?.length) return base;
      const bits = ev.blueprintRows.map((r) => `${r.label}: ${r.value}`).join(" · ");
      return `${base} · ${bits}`;
    }
    case "booking":
      return ev.summaryLine?.trim() || ev.rows.map((r) => `${r.label}: ${r.value}`).join(" · ") || "Booking";
    case "callFeedback":
      return `${ev.durationLabel}${ev.status && ev.status !== "Not Added" ? ` · ${ev.status}` : ""}${ev.subStatus && ev.subStatus !== "Not Added" ? ` · ${ev.subStatus}` : ""}${ev.remarks && ev.remarks !== "Not Added" ? ` · ${ev.remarks}` : ""}`.trim() || "Call";
    case "aiSummary":
      return ev.bullets[0]?.trim() ? `${ev.timeLabel} · ${ev.bullets[0]}` : ev.timeLabel;
    case "comment":
      return `${ev.author}${ev.body ? ` · ${ev.body}` : ""}`;
    case "structured": {
      const rowBits =
        ev.rows?.map((r) => `${r.label}: ${r.value}`).join(" · ") ?? "";
      return rowBits ? `${ev.headline} · ${rowBits}` : ev.headline;
    }
    default:
      return "Event";
  }
}

export function journeyEventTypeLabel(ev: JourneyEvent): string {
  switch (ev.type) {
    case "note":
      return "Activity";
    case "fieldUpdate":
      return "Field update";
    case "booking":
      return "Booking";
    case "callFeedback":
      return "Call";
    case "aiSummary":
      return "AI";
    case "comment":
      return "Comment";
    case "structured":
      return structuredTypeLabel(ev.kind);
    default:
      return "Event";
  }
}

export function filterDaysBySearch(days: JourneyDay[], q: string): JourneyDay[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return days;
  return days
    .map((d) => ({
      ...d,
      events: d.events.filter((ev) => journeyEventPreview(ev).toLowerCase().includes(needle)),
    }))
    .filter((d) => d.events.length > 0);
}
