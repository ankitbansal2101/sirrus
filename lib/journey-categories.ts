import type { JourneyDay, JourneyEvent } from "@/lib/lead-journey-types";

export type JourneyCategory = "all" | "system" | "call" | "booking" | "ai" | "comment";

export function eventCategory(ev: JourneyEvent): Exclude<JourneyCategory, "all"> {
  switch (ev.type) {
    case "note":
      return "system";
    case "booking":
      return "booking";
    case "callFeedback":
      return "call";
    case "aiSummary":
      return "ai";
    case "comment":
      return "comment";
    default:
      return "system";
  }
}

export function filterJourneyDays(days: JourneyDay[], filter: JourneyCategory): JourneyDay[] {
  if (filter === "all") return days;
  return days
    .map((d) => ({
      ...d,
      events: d.events.filter((ev) => eventCategory(ev) === filter),
    }))
    .filter((d) => d.events.length > 0);
}

export const JOURNEY_FILTER_OPTIONS: { id: JourneyCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "system", label: "Timeline" },
  { id: "call", label: "Calls" },
  { id: "booking", label: "Booking" },
  { id: "ai", label: "AI" },
  { id: "comment", label: "Comments" },
];
