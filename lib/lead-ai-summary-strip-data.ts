import { CONFIGURATOR_V1_PREVIEW_AI_INSIGHT } from "@/lib/configurator-v1-preview-content";
import { getLeadDetailDataProfile } from "@/lib/lead-detail-fixtures";
import type { LeadRow } from "@/lib/leads-sample-data";

export type LeadAiSummaryStripInsight = {
  summaryBody: string;
  nextSteps: string;
  /** Shown after "Last Updated on: " */
  lastUpdatedLabel: string;
};

const KAWAL_INSIGHT: LeadAiSummaryStripInsight = {
  summaryBody:
    "This is a new lead who expressed interest in Cirrus Eco Habitat's luxury project in the Banat area by filling out a form. This is the first interaction between the agent and the lead. The lead's response to the initial contact was unclear, with the lead asking for a moment to respond. Further information is needed to understand the lead's interest and requirements. The agent has placed a call to the lead for follow-up. The lead is still at the 'Contacted' stage. The latest call resulted in voicemail, indicating the lead was unavailable. No conversation data is available to provide further insights into the lead's current needs or sentiment. No changes in budget, urgency, or property requirements can be determined at this stage due to the lack of conversation data.",
  nextSteps:
    "Attempt to contact the lead again. If unsuccessful, try a different communication method (email, SMS).",
  lastUpdatedLabel: "15 Apr 2026, 06:27 PM",
};

export function getAiSummaryStripInsightForLead(lead: LeadRow): LeadAiSummaryStripInsight | null {
  const p = getLeadDetailDataProfile(lead);
  if (p === "kawal") return KAWAL_INSIGHT;
  if (p === "org_admin_preview") return CONFIGURATOR_V1_PREVIEW_AI_INSIGHT;
  return null;
}
