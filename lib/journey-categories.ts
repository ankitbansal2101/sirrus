import type { JourneyDay, JourneyEvent } from "@/lib/lead-journey-types";
import { journeyRemarksRowValue, journeyWidgetFieldIsMeaningful } from "@/lib/lead-journey-utils";

export type JourneyModuleFilter = "remarks" | "calls" | "leadUpdate" | "tasks";

export const JOURNEY_MODULE_FILTERS: { id: JourneyModuleFilter; label: string }[] = [
  { id: "remarks", label: "Remarks" },
  { id: "calls", label: "Calls" },
  { id: "leadUpdate", label: "Lead update" },
  { id: "tasks", label: "Tasks" },
];

export function journeyEventMatchesModuleFilter(ev: JourneyEvent, filter: JourneyModuleFilter): boolean {
  switch (filter) {
    case "remarks":
      if (ev.type === "comment") return true;
      if (ev.type === "remark") return true;
      if (ev.type === "callFeedback" && journeyWidgetFieldIsMeaningful(ev.remarks)) return true;
      if (ev.type === "fieldUpdate" && !!journeyRemarksRowValue(ev.blueprintRows)) return true;
      if (ev.type === "booking" && !!journeyRemarksRowValue(ev.rows)) return true;
      return false;
    case "calls":
      if (ev.type === "callFeedback") return true;
      if (ev.type === "structured") {
        const k = ev.kind.toLowerCase();
        return k.startsWith("call.") || k.includes("call");
      }
      return false;
    case "leadUpdate":
      if (ev.type === "fieldUpdate" || ev.type === "booking") return true;
      if (ev.type === "structured") {
        const k = ev.kind.toLowerCase();
        return k.startsWith("lead.") && k !== "lead.edit";
      }
      return false;
    case "tasks":
      if (ev.type === "comment" && !!ev.followupLabel?.trim()) return true;
      if (ev.type === "fieldUpdate" || ev.type === "booking") {
        const rows = ev.type === "fieldUpdate" ? ev.blueprintRows : ev.rows;
        return !!rows?.some((r) => /task|follow-?up/i.test(r.label));
      }
      return false;
    default:
      return false;
  }
}

/** Show only events for the selected module; pass `null` for no module filter. */
export function filterDaysByModuleFilter(days: JourneyDay[], filter: JourneyModuleFilter | null): JourneyDay[] {
  if (!filter) return days;
  return days
    .map((d) => ({
      ...d,
      events: d.events.filter((ev) => journeyEventMatchesModuleFilter(ev, filter)),
    }))
    .filter((d) => d.events.length > 0);
}
