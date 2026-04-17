import type { LeadRow } from "@/lib/leads-sample-data";

/** Stable id for Widget layout (V1) configurator preview — drives dummy hub / AI / history / journey data. */
export const CONFIGURATOR_V1_PREVIEW_LEAD_ID = "cfg-org-admin-v1";

export function isConfiguratorV1PreviewLead(lead: Pick<LeadRow, "id">): boolean {
  return lead.id === CONFIGURATOR_V1_PREVIEW_LEAD_ID;
}

/** Placeholder lead row for org admins configuring widgets (no real customer names). */
export function createConfiguratorV1PreviewLead(): LeadRow {
  return {
    id: CONFIGURATOR_V1_PREVIEW_LEAD_ID,
    name: "John Doe",
    temp: "Warm",
    leadId: "L-PREVIEW-0001",
    stage: "Booked",
    source: "Website",
    subSource: "Contact form",
    project: "Sample Heights",
    lud: "16.04.2026",
    assigned: "JS",
    assignedInitials: "JS",
    assignedTitle: "Sales Manager",
    assignedDisplayName: "Jane Smith",
    drawerFundingSource: "Self funded",
    createDate: "2026-02-12T13:46:37.441Z",
    whatsapp: "+1 555 010 0199",
    altNumber: "+1 555 010 0200",
    email: "john.doe@example.com",
    preferredUnit: "Tower A — 12th floor",
    maxBudget: "-",
    propertyStatus: "-",
    purpose: "Primary residence",
    otherPrefs: "Prefers east-facing units",
    occupation: "Software engineer",
    qualification: "-",
    funding: "-",
    budgetRange: "USD 450k – 520k",
    preferredLocation: "Downtown",
    age: "38",
    gender: "-",
    company: "Acme Corporation",
    state: "California",
    city: "San Francisco",
    region: "Bay Area",
    designation: "Director",
  };
}
