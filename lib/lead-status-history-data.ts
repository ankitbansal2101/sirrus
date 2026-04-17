import { CONFIGURATOR_V1_PREVIEW_STATUS_HISTORY } from "@/lib/configurator-v1-preview-content";
import { getLeadDetailDataProfile } from "@/lib/lead-detail-fixtures";
import type { LeadRow } from "@/lib/leads-sample-data";

export type StatusHistoryTone = "orange" | "blue" | "green" | "yellow" | "purple" | "pink" | "slate";

/** Site Visit funnel — second pill label + style key (CRM). */
export type SiteVisitSubStatusPill = "Scheduled" | "Visit Done" | "Revisit done";

export type LeadStatusHistoryEntry = {
  id: string;
  /** Raw CRM label (e.g. SITE VISIT DONE). Site Visit rows are split into two pills in the UI. */
  statusLabel: string;
  tone: StatusHistoryTone;
  /**
   * Shown in the timeline date lane. Use `"<date>, <time>"` (comma + space) when time is known
   * so the UI can stack date and time vertically.
   */
  modifiedLabel: string;
  /** Person or system that applied the stage change. */
  modifiedBy: string;
  /** Optional override for the second pill when auto-parse from `statusLabel` is not enough. */
  siteVisitSubStatus?: SiteVisitSubStatusPill;
};

/** Background + border for Site Visit sub-status pills (matches product HTML). */
export const SITE_VISIT_SUB_PILL_STYLE: Record<
  SiteVisitSubStatusPill,
  { backgroundColor: string; borderColor: string }
> = {
  Scheduled: {
    backgroundColor: "rgb(246, 235, 177)",
    borderColor: "rgb(193, 192, 203)",
  },
  "Visit Done": {
    backgroundColor: "rgba(19, 210, 2, 0.59)",
    borderColor: "rgb(193, 192, 203)",
  },
  "Revisit done": {
    backgroundColor: "rgba(242, 210, 255, 0.75)",
    borderColor: "rgb(193, 192, 203)",
  },
};

const SITE_VISIT_SUB_LABEL: Record<SiteVisitSubStatusPill, string> = {
  Scheduled: "Scheduled",
  "Visit Done": "Visit Done",
  "Revisit done": "Revisit done",
};

/** When non-null, timeline shows "Site Visit" + second pill (never the combined SITE VISIT DONE label). */
export function resolveSiteVisitTimelinePills(
  entry: LeadStatusHistoryEntry,
): null | { secondaryPill: SiteVisitSubStatusPill; secondaryLabel: string } {
  if (entry.siteVisitSubStatus) {
    const k = entry.siteVisitSubStatus;
    return { secondaryPill: k, secondaryLabel: SITE_VISIT_SUB_LABEL[k] };
  }
  const u = entry.statusLabel.toUpperCase().replace(/\s+/g, " ");
  if (!(u.includes("SITE VISIT") || u.includes("SITE REVISIT"))) return null;
  if (u.includes("PLANNED")) return { secondaryPill: "Scheduled", secondaryLabel: "Scheduled" };
  if (u.includes("REVISIT") && u.includes("DONE")) return { secondaryPill: "Revisit done", secondaryLabel: "Revisit done" };
  if (u.includes("VISIT DONE")) return { secondaryPill: "Visit Done", secondaryLabel: "Visit Done" };
  return null;
}

export const STATUS_HISTORY_PILL_STYLES: Record<
  StatusHistoryTone,
  { bg: string; color: string; border: string }
> = {
  orange: { bg: "#fff3e0", color: "#e65100", border: "#ffe0b2" },
  blue: { bg: "#e3f2fd", color: "#1565c0", border: "#bbdefb" },
  green: { bg: "#e8f5e9", color: "#2e7d32", border: "#c8e6c9" },
  yellow: { bg: "#fffde7", color: "#f9a825", border: "#fff9c4" },
  purple: { bg: "#f3e5f5", color: "#6a1b9a", border: "#e1bee7" },
  pink: { bg: "#fce4ec", color: "#c2185b", border: "#f8bbd9" },
  slate: { bg: "#eceff1", color: "#455a64", border: "#cfd8dc" },
};

const KAWAL_STATUS_HISTORY: LeadStatusHistoryEntry[] = [
  {
    id: "h1",
    statusLabel: "BOOKED",
    tone: "green",
    modifiedLabel: "10 Apr 2026, 7:30 PM",
    modifiedBy: "kawal gulati",
  },
  {
    id: "h2",
    statusLabel: "NEGOTIATION",
    tone: "purple",
    modifiedLabel: "02 Apr 2026, 3:15 PM",
    modifiedBy: "Prasun Adara",
  },
  {
    id: "h3",
    statusLabel: "SITE REVISIT DONE",
    tone: "yellow",
    modifiedLabel: "25 Mar 2026, 11:20 AM",
    modifiedBy: "Sunil Sabat",
  },
  {
    id: "h4",
    statusLabel: "SITE VISIT DONE",
    tone: "yellow",
    modifiedLabel: "21 Mar 2026, 4:45 PM",
    modifiedBy: "Vishakh G",
  },
  {
    id: "h5",
    statusLabel: "SITE VISIT PLANNED",
    tone: "yellow",
    modifiedLabel: "20 Mar 2026, 9:30 AM",
    modifiedBy: "kawal gulati",
  },
];

/** Matches reference “Ashish / Zoho” style timeline for generic leads. */
const DEMO_STATUS_HISTORY: LeadStatusHistoryEntry[] = [
  {
    id: "d1",
    statusLabel: "NEGOTIATION",
    tone: "purple",
    modifiedLabel: "10 Apr 2026, 4:18 PM",
    modifiedBy: "Prasun Adara",
  },
  {
    id: "d2",
    statusLabel: "SITE REVISIT DONE",
    tone: "yellow",
    modifiedLabel: "18 Mar 2026, 11:05 AM",
    modifiedBy: "Adara Sales",
  },
  {
    id: "d3",
    statusLabel: "SITE VISIT DONE",
    tone: "yellow",
    modifiedLabel: "17 Mar 2026, 2:40 PM",
    modifiedBy: "Adara Sales",
  },
  {
    id: "d4",
    statusLabel: "SITE VISIT PLANNED",
    tone: "yellow",
    modifiedLabel: "17 Mar 2026, 9:00 AM",
    modifiedBy: "Adara Sales",
  },
  {
    id: "d5",
    statusLabel: "OPEN",
    tone: "orange",
    modifiedLabel: "17 Mar 2026, 8:00 AM",
    modifiedBy: "System",
  },
];

export function getStatusHistoryForLead(lead: LeadRow): LeadStatusHistoryEntry[] {
  const p = getLeadDetailDataProfile(lead);
  if (p === "kawal") return KAWAL_STATUS_HISTORY;
  if (p === "org_admin_preview") return CONFIGURATOR_V1_PREVIEW_STATUS_HISTORY;
  if (p === "empty_all" || p === "empty_history") return [];
  return DEMO_STATUS_HISTORY;
}
