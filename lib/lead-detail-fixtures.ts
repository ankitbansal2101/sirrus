import { CONFIGURATOR_V1_PREVIEW_LEAD_ID } from "@/lib/configurator-v1-preview-lead";
import type { LeadRow } from "@/lib/leads-sample-data";

/** Reference lead with rich demo data (activity, AI, history, journey, overview patch). */
export const KAWAL_REFERENCE_LEAD_ID = "4";
export const KAWAL_REFERENCE_LEAD_NUMBER = "L0226000001";

/**
 * QA / product fixture rows in `SAMPLE_LEADS` (ids 100–105, leadIds `L-FIX-0100` … `L-FIX-0105`).
 * Open each row from Manage Leads to exercise lead-detail states without design mocks.
 */
export const LEAD_DETAIL_FIXTURE_IDS = {
  EMPTY_ALL: "100",
  EMPTY_AI: "101",
  EMPTY_ACTIVITY: "102",
  EMPTY_HISTORY: "103",
  MINIMAL_PROFILE: "104",
  SMALL_JOURNEY: "105",
} as const;

export type LeadDetailDataProfile =
  | "kawal"
  /** Widget layout (V1) configurator — generic copy, same panel richness as kawal. */
  | "org_admin_preview"
  | "empty_all"
  | "empty_ai"
  | "empty_activity"
  | "empty_history"
  | "minimal_profile"
  | "small_journey"
  | "default";

const PROFILE_BY_LEAD_ID: Record<string, LeadDetailDataProfile> = {
  [LEAD_DETAIL_FIXTURE_IDS.EMPTY_ALL]: "empty_all",
  [LEAD_DETAIL_FIXTURE_IDS.EMPTY_AI]: "empty_ai",
  [LEAD_DETAIL_FIXTURE_IDS.EMPTY_ACTIVITY]: "empty_activity",
  [LEAD_DETAIL_FIXTURE_IDS.EMPTY_HISTORY]: "empty_history",
  [LEAD_DETAIL_FIXTURE_IDS.MINIMAL_PROFILE]: "minimal_profile",
  [LEAD_DETAIL_FIXTURE_IDS.SMALL_JOURNEY]: "small_journey",
};

const PROFILE_BY_LEAD_NUMBER: Record<string, LeadDetailDataProfile> = {
  "L-FIX-0100": "empty_all",
  "L-FIX-0101": "empty_ai",
  "L-FIX-0102": "empty_activity",
  "L-FIX-0103": "empty_history",
  "L-FIX-0104": "minimal_profile",
  "L-FIX-0105": "small_journey",
};

export function isKawalReferenceLead(lead: LeadRow): boolean {
  return lead.id === KAWAL_REFERENCE_LEAD_ID || lead.leadId === KAWAL_REFERENCE_LEAD_NUMBER;
}

/** Drives which sample payloads power Activity, AI strip, status history, and journey. */
export function getLeadDetailDataProfile(lead: LeadRow): LeadDetailDataProfile {
  if (lead.id === CONFIGURATOR_V1_PREVIEW_LEAD_ID) return "org_admin_preview";
  if (isKawalReferenceLead(lead)) return "kawal";
  return PROFILE_BY_LEAD_ID[lead.id] ?? PROFILE_BY_LEAD_NUMBER[lead.leadId] ?? "default";
}

/** Human-readable list for engineering handoff. */
export const LEAD_DETAIL_FIXTURE_SUMMARIES: { id: string; leadId: string; label: string; notes: string }[] = [
  {
    id: LEAD_DETAIL_FIXTURE_IDS.EMPTY_ALL,
    leadId: "L-FIX-0100",
    label: "Empty — all panels",
    notes: "No remarks, tasks, status history, journey; AI insight null.",
  },
  {
    id: LEAD_DETAIL_FIXTURE_IDS.EMPTY_AI,
    leadId: "L-FIX-0101",
    label: "Empty AI summary only",
    notes: "Sample remarks, tasks, and status history; AI insight null.",
  },
  {
    id: LEAD_DETAIL_FIXTURE_IDS.EMPTY_ACTIVITY,
    leadId: "L-FIX-0102",
    label: "Empty activity hub",
    notes: "No tasks and no remarks; status history still populated; AI null.",
  },
  {
    id: LEAD_DETAIL_FIXTURE_IDS.EMPTY_HISTORY,
    leadId: "L-FIX-0103",
    label: "Empty status history",
    notes: "Remarks + tasks present; status history empty; AI null.",
  },
  {
    id: LEAD_DETAIL_FIXTURE_IDS.MINIMAL_PROFILE,
    leadId: "L-FIX-0104",
    label: "Minimal identity / overview",
    notes: 'Mostly "-" on the lead row; same hub/history as empty-AI fixture.',
  },
  {
    id: LEAD_DETAIL_FIXTURE_IDS.SMALL_JOURNEY,
    leadId: "L-FIX-0105",
    label: "Short journey timeline",
    notes: "Non-Kawal journey with a few events; demo remarks/tasks/history; AI null.",
  },
];
