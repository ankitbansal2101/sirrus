/**
 * Pipeline stage dot colors (CRM reference). Use for pills, table, left rail, etc.
 * Border for outline pills: `STAGE_PILL_BORDER`.
 */
export const STAGE_PILL_BORDER = "rgb(193, 192, 203)";

const DOT: Record<string, string> = {
  Open: "rgb(253, 186, 116)",
  Qualified: "rgb(216, 223, 255)",
  "Site Visit": "rgb(253, 240, 171)",
  Opportunity: "rgb(242, 210, 255)",
  Booked: "rgb(194, 250, 213)",
  Dropped: "rgb(255, 180, 164)",
  /** Legacy labels → closest palette (`New Lead` fill matches CRM column cells). */
  "New Lead": "rgb(197, 235, 255)",
  Prospects: "rgb(216, 223, 255)",
  Contacted: "rgb(252, 186, 116)",
  Negotiation: "rgb(242, 210, 255)",
  Unqualified: "rgb(255, 180, 164)",
  "Is a CP": "rgb(242, 210, 255)",
};

/** Solid dot / accent fill for a stage name. */
export function stageDotColor(stage: string): string {
  return DOT[stage] ?? "rgb(233, 234, 241)";
}

const CRM_LABEL = (s: string) => s.toUpperCase().replace(/\s+/g, " ");

/**
 * Maps Zoho-style history strings (often uppercase) to a pipeline stage key so fills match
 * kanban / table stage cells (`stageDotColor`).
 */
export function historyStatusLabelToStageKey(statusLabel: string): string {
  const u = CRM_LABEL(statusLabel);
  if (u === "BOOKED") return "Booked";
  if (u === "NEGOTIATION" || u === "NEGOTIATIONS") return "Negotiation";
  if (u === "OPEN") return "Open";
  if (u === "QUALIFIED") return "Qualified";
  if (u === "CONTACTED") return "Contacted";
  if (u === "NEW LEAD") return "New Lead";
  if (u === "PROSPECTS") return "Prospects";
  if (u === "DROPPED") return "Dropped";
  if (u === "UNQUALIFIED") return "Unqualified";
  if (u === "OPPORTUNITY") return "Opportunity";
  if (u.includes("SITE VISIT") || u.includes("SITE REVISIT")) return "Site Visit";
  if (u === "IS A CP") return "Is a CP";
  return statusLabel.replace(/\w+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Solid pill background for a history row’s main stage (same RGB as stage column cells). */
export function historyStatusPillFill(statusLabel: string): string {
  return stageDotColor(historyStatusLabelToStageKey(statusLabel));
}
