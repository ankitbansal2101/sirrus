/** Stages shown on Change Stage / first-glance pills (dot colours match CRM reference). */
export type LeadStageOption = {
  id: string;
  dotColor: string;
};

export const LEAD_STAGE_OPTIONS: LeadStageOption[] = [
  { id: "New Lead", dotColor: "#64b5f6" },
  { id: "Prospects", dotColor: "#9e9e9e" },
  { id: "Site Visit", dotColor: "#fdd835" },
  { id: "Negotiation", dotColor: "#b39ddb" },
  { id: "Booked", dotColor: "#81c784" },
  { id: "Dropped", dotColor: "#ffab91" },
  { id: "Unqualified", dotColor: "#f48fb1" },
  { id: "Is a CP", dotColor: "#7e57c2" },
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
