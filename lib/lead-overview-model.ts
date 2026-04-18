import { isKawalReferenceLead } from "@/lib/lead-detail-fixtures";
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

/** Partially masks email local-part for display (e.g. edit form before unlock). */
export function maskEmailSensitive(email: string): string {
  if (!email || email === "-") return "-";
  const at = email.indexOf("@");
  if (at < 2) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  const inner = Math.max(8, local.length - 2);
  return `${local[0]}${"*".repeat(inner)}${local.slice(-1)}${domain}`;
}

function maskEmail(email: string): string {
  return maskEmailSensitive(email);
}

/** Masked WhatsApp for display; preserves strings that already look masked (e.g. `XXXXXX2219`). */
export function maskWhatsappSensitive(raw: string): string {
  const t = raw.trim();
  if (!t || t === "-") return "";
  if (/[Xx]/.test(t)) return t;
  const d = raw.replace(/\D/g, "");
  if (d.length >= 4) return `XXXXXX${d.slice(-4)}`;
  return t;
}

/** Lead overview / rail: show +91- plus masked middle when `whatsapp` stores digits (or legacy mask string). */
function overviewWhatsappDisplay(raw: string): string {
  if (!raw || raw.trim() === "" || raw === "-") return "-";
  const t = raw.trim();
  if (t.startsWith("+")) return t;
  const m = maskWhatsappSensitive(t);
  return m ? `+91-${m}` : "-";
}

function baseFromLead(lead: LeadRow): LeadOverviewValues {
  return {
    fullName: lead.name,
    projectName: lead.project,
    source: lead.source,
    subSource: dash(lead.subSource),
    whatsapp: overviewWhatsappDisplay(lead.whatsapp),
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
  if (isKawalReferenceLead(lead)) {
    return { ...base, ...KAWAL_OVERVIEW_PATCH };
  }
  return base;
}
