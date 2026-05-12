import { formatIsoDateDisplay, formatLudDisplay } from "@/lib/lead-formatters";
import { getLeadOverviewValues } from "@/lib/lead-overview-model";
import { LEFT_RAIL_FIELD_DEFINITIONS, type LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";

function assignedLabel(lead: LeadRow) {
  return lead.assignedDisplayName ?? lead.assignedTitle ?? lead.assigned;
}

export function labelForLeftRailFieldId(id: LeftRailFieldId): string {
  return LEFT_RAIL_FIELD_DEFINITIONS.find((d) => d.id === id)?.label ?? id;
}

/** Read-only label + string value for canvas “field” blocks (matches left-rail semantics). */
export function getCanvasFieldRow(lead: LeadRow, fieldId: LeftRailFieldId): { label: string; value: string } {
  const label = labelForLeftRailFieldId(fieldId);
  const o = getLeadOverviewValues(lead);
  switch (fieldId) {
    case "phone":
      return { label, value: o.whatsapp };
    case "alternate":
      return { label, value: o.alternateNumber };
    case "email":
      return { label, value: o.email };
    case "source":
      return { label, value: o.source };
    case "subSource":
      return { label, value: o.subSource };
    case "interestedIn":
      return { label, value: o.preferredUnitType };
    case "budget": {
      const v = o.maxBudget !== "-" ? o.maxBudget : o.budgetRange;
      return { label, value: v };
    }
    case "leadOwner":
      return { label, value: o.assignedTo };
    case "assigned":
      return { label, value: assignedLabel(lead) };
    case "created":
      return { label, value: formatIsoDateDisplay(lead.createDate) };
    case "lastUpdated":
      return { label, value: formatLudDisplay(lead.lud) };
    case "siteVisit":
      return { label, value: o.siteVisitScheduled };
    case "siteRevisit":
      return { label, value: o.revisitScheduled };
    default:
      return { label, value: "—" };
  }
}
