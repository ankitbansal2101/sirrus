import type { LeadRow } from "@/lib/leads-sample-data";

export type LeadFormPurpose = "Investment" | "Personal Use";
export type LeadFormFunding = "Loan" | "Self funded";

export type LeadFormState = {
  fullName: string;
  projectName: string;
  source: string;
  subSource: string;
  whatsappDigits: string;
  alternateDigits: string;
  email: string;
  assignedTo: string;
  newFieldAb: string;
  preferredUnit: string;
  maxBudget: string;
  propertyStatus: string;
  otherPreferences: string;
  preferredLocation: string;
  purpose: LeadFormPurpose;
  funding: LeadFormFunding;
  age: string;
  gender: string;
  occupation: string;
  qualification: string;
  bookingDate: string;
  anniversaryDate: string;
};

function clean(v: string): string {
  if (!v || v === "-") return "";
  return v.trim();
}

/** Last up to 10 digits for India local part. */
function digitsForPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length <= 10) return d;
  if (d.startsWith("91") && d.length >= 12) return d.slice(-10);
  return d.slice(-10);
}

function normalizePurpose(raw: string): LeadFormPurpose {
  const s = raw.toLowerCase();
  if (s.includes("personal")) return "Personal Use";
  return "Investment";
}

function normalizeFunding(raw: string): LeadFormFunding {
  const s = raw.toLowerCase();
  if (s.includes("self")) return "Self funded";
  return "Loan";
}

export function emptyLeadFormState(): LeadFormState {
  return {
    fullName: "",
    projectName: "",
    source: "",
    subSource: "",
    whatsappDigits: "",
    alternateDigits: "",
    email: "",
    assignedTo: "",
    newFieldAb: "",
    preferredUnit: "",
    maxBudget: "",
    propertyStatus: "",
    otherPreferences: "",
    preferredLocation: "",
    purpose: "Investment",
    funding: "Loan",
    age: "",
    gender: "",
    occupation: "",
    qualification: "",
    bookingDate: "",
    anniversaryDate: "",
  };
}

export function buildLeadFormStateFromLead(lead: LeadRow): LeadFormState {
  const fundingRaw = lead.drawerFundingSource ?? lead.funding;
  return {
    fullName: lead.name,
    projectName: lead.project,
    source: clean(lead.source),
    subSource: clean(lead.subSource),
    whatsappDigits: digitsForPhone(lead.whatsapp),
    alternateDigits: digitsForPhone(clean(lead.altNumber)),
    email: clean(lead.email),
    assignedTo: clean(lead.assignedTitle ?? lead.assignedDisplayName ?? lead.assigned),
    newFieldAb: "",
    preferredUnit: clean(lead.preferredUnit),
    maxBudget: clean(lead.maxBudget),
    propertyStatus: clean(lead.propertyStatus),
    otherPreferences: clean(lead.otherPrefs),
    preferredLocation: clean(lead.preferredLocation),
    purpose: normalizePurpose(lead.purpose),
    funding: normalizeFunding(fundingRaw),
    age: clean(lead.age),
    gender: clean(lead.gender),
    occupation: clean(lead.occupation),
    qualification: clean(lead.qualification),
    bookingDate: "",
    anniversaryDate: "",
  };
}

export function buildLeadFormState(lead: LeadRow | null | undefined): LeadFormState {
  if (!lead) return emptyLeadFormState();
  return buildLeadFormStateFromLead(lead);
}
