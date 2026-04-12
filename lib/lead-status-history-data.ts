import type { LeadRow } from "@/lib/leads-sample-data";

export type StatusHistoryTone = "orange" | "blue" | "green" | "yellow" | "purple" | "pink" | "slate";

export type LeadStatusHistoryEntry = {
  id: string;
  /** Short label shown in pill, e.g. "NEGOTIATION" */
  statusLabel: string;
  tone: StatusHistoryTone;
  /** Days in stage; `null` renders as "—" */
  durationDays: number | null;
  modifiedLabel: string;
  modifiedBy: string;
};

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
    durationDays: null,
    modifiedLabel: "10 Apr 2026, 7:30 PM",
    modifiedBy: "kawal gulati",
  },
  {
    id: "h2",
    statusLabel: "NEGOTIATION",
    tone: "orange",
    durationDays: 8,
    modifiedLabel: "02 Apr 2026",
    modifiedBy: "Prasun Adara",
  },
  {
    id: "h3",
    statusLabel: "SITE REVISIT DONE",
    tone: "blue",
    durationDays: 4,
    modifiedLabel: "25 Mar 2026",
    modifiedBy: "Sunil Sabat",
  },
  {
    id: "h4",
    statusLabel: "SITE VISIT DONE",
    tone: "orange",
    durationDays: 1,
    modifiedLabel: "21 Mar 2026",
    modifiedBy: "Vishakh G",
  },
  {
    id: "h5",
    statusLabel: "SITE VISIT PLANNED",
    tone: "green",
    durationDays: 0,
    modifiedLabel: "20 Mar 2026",
    modifiedBy: "kawal gulati",
  },
];

/** Matches reference “Ashish / Zoho” style timeline for generic leads. */
const DEMO_STATUS_HISTORY: LeadStatusHistoryEntry[] = [
  {
    id: "d1",
    statusLabel: "NEGOTIATION",
    tone: "orange",
    durationDays: null,
    modifiedLabel: "10 Apr 2026",
    modifiedBy: "Prasun Adara",
  },
  {
    id: "d2",
    statusLabel: "SITE REVISIT DONE",
    tone: "blue",
    durationDays: 23,
    modifiedLabel: "18 Mar 2026",
    modifiedBy: "Adara Sales",
  },
  {
    id: "d3",
    statusLabel: "SITE VISIT DONE",
    tone: "orange",
    durationDays: 1,
    modifiedLabel: "17 Mar 2026",
    modifiedBy: "Adara Sales",
  },
  {
    id: "d4",
    statusLabel: "SITE VISIT PLANNED",
    tone: "green",
    durationDays: 0,
    modifiedLabel: "17 Mar 2026",
    modifiedBy: "Adara Sales",
  },
  {
    id: "d5",
    statusLabel: "OPEN",
    tone: "green",
    durationDays: 0,
    modifiedLabel: "17 Mar 2026",
    modifiedBy: "System",
  },
];

export function getStatusHistoryForLead(lead: LeadRow): LeadStatusHistoryEntry[] {
  if (lead.id === "4" || lead.leadId === "L0226000001") return KAWAL_STATUS_HISTORY;
  return DEMO_STATUS_HISTORY;
}
