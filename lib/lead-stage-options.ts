/** Stages shown on Change Stage / first-glance pills (dot colours match CRM reference). */
export type LeadStageOption = {
  id: string;
  dotColor: string;
};

/** Dot hex matches `lib/lead-stage-colors.ts` (CRM reference RGBs). */
export const LEAD_STAGE_OPTIONS: LeadStageOption[] = [
  { id: "New Lead", dotColor: "#d8dfff" },
  { id: "Prospects", dotColor: "#d8dfff" },
  { id: "Site Visit", dotColor: "#fdf0ab" },
  { id: "Negotiation", dotColor: "#f2d2ff" },
  { id: "Booked", dotColor: "#c2fad5" },
  { id: "Dropped", dotColor: "#ffb4a4" },
  { id: "Unqualified", dotColor: "#ffb4a4" },
  { id: "Is a CP", dotColor: "#f2d2ff" },
];

const STAGE_ALIASES: Record<string, string> = {
  Contacted: "Prospects",
};

const OPTION_IDS = new Set(LEAD_STAGE_OPTIONS.map((o) => o.id));

/** Map raw lead.stage to a pill id when the value is an alias or legacy label. */
export function resolveStageForPills(stage: string): string {
  const mapped = STAGE_ALIASES[stage] ?? stage;
  if (OPTION_IDS.has(mapped)) return mapped;
  if (OPTION_IDS.has(stage)) return stage;
  return "";
}

/** Coerce any CRM stage string to a pipeline pill id for forms and saves. */
export function normalizeToPipelineStageId(stage: string): string {
  const resolved = resolveStageForPills(stage);
  if (resolved) return resolved;
  return LEAD_STAGE_OPTIONS[0]?.id ?? stage;
}
