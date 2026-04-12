import type { LeadRow } from "@/lib/leads-sample-data";

export type LeadOverviewValues = {
  fullName: string;
  projectName: string;
  source: string;
  subSource: string;
  whatsapp: string;
  alternateNumber: string;
  email: string;
  assignedTo: string;
  budgetRange: string;
  age: string;
  gender: string;
  occupation: string;
  qualification: string;
  fundingSource: string;
  companyName: string;
  state: string;
  city: string;
  region: string;
  designation: string;
  preferredUnitType: string;
  maxBudget: string;
  propertyStatus: string;
  purpose: string;
  preferredLocation: string;
  otherPreferences: string;
  unqualifiedDate: string;
  unqualifiedReason: string;
  droppedDate: string;
  droppedReason: string;
  siteVisitScheduled: string;
  revisitScheduled: string;
  siteVisitDone: string;
};

function dash(v: string) {
  return v && v !== "" ? v : "-";
}

function maskEmail(email: string): string {
  if (!email || email === "-") return "-";
  const at = email.indexOf("@");
  if (at < 2) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const inner = Math.max(8, local.length - 2);
  return `${local[0]}${"*".repeat(inner)}${local.slice(-1)}${domain}`;
}

function baseFromLead(lead: LeadRow): LeadOverviewValues {
  return {
    fullName: lead.name,
    projectName: lead.project,
    source: lead.source,
    subSource: dash(lead.subSource),
    whatsapp: lead.whatsapp,
    alternateNumber: dash(lead.altNumber),
    email: maskEmail(lead.email),
    assignedTo: dash(lead.assignedTitle ?? lead.assignedDisplayName ?? lead.assigned),
    budgetRange: dash(lead.budgetRange),
    age: dash(lead.age),
    gender: dash(lead.gender),
    occupation: dash(lead.occupation),
    qualification: dash(lead.qualification),
    fundingSource: dash(lead.funding),
    companyName: dash(lead.company),
    state: dash(lead.state),
    city: dash(lead.city),
    region: dash(lead.region),
    designation: dash(lead.designation),
    preferredUnitType: dash(lead.preferredUnit),
    maxBudget: dash(lead.maxBudget),
    propertyStatus: dash(lead.propertyStatus),
    purpose: dash(lead.purpose),
    preferredLocation: dash(lead.preferredLocation),
    otherPreferences: dash(lead.otherPrefs),
    unqualifiedDate: "-",
    unqualifiedReason: "-",
    droppedDate: "-",
    droppedReason: "-",
    siteVisitScheduled: "-",
    revisitScheduled: "-",
    siteVisitDone: "-",
  };
}

/** Prod snapshot values for “Kawal Lead Prasun” Lead Overview. */
const KAWAL_OVERVIEW_PATCH: Partial<LeadOverviewValues> = {
  email: "K**************7@gmail.com",
  budgetRange: "-",
  occupation: "Salaried",
  state: "Haryana",
  city: "panipat",
  region: "jkas",
  designation: "abc",
  preferredUnitType: "2 BHK",
  maxBudget: "₹ 999999",
};

export function getLeadOverviewValues(lead: LeadRow): LeadOverviewValues {
  const base = baseFromLead(lead);
  if (lead.id === "4" || lead.leadId === "L0226000001") {
    return { ...base, ...KAWAL_OVERVIEW_PATCH };
  }
  return base;
}
