export const LEAD_DETAIL_TABS = [
  "Activity",
  "AI Insights",
  "Lead Journey",
  "Lead Overview",
  "Change Stage",
  "Quotations",
] as const;

export type LeadDetailTabLabel = (typeof LEAD_DETAIL_TABS)[number];
