/**
 * Maps `JourneyStructuredEvent.kind` to filter buckets and digest badges.
 * Add new `kind` strings anytime — unknown kinds fall back to sensible defaults.
 */

export type JourneyFilterBucket = "system" | "call" | "booking" | "ai" | "comment";

const TYPE_LABELS: Record<string, string> = {
  "lead.addition": "Lead",
  "lead.manual_upload": "Lead",
  "lead.edit": "Edit",
  "lead.assign": "Assign",
  "lead.reassign": "Assign",
  "call.missed": "Call",
  "comment.added": "Comment",
  "view.masked.whatsapp": "Masked",
  "view.masked.alternate": "Masked",
  "view.masked.email": "Masked",
  "sv.feedback.customer": "Site visit",
};

export function structuredFilterBucket(kind: string): JourneyFilterBucket {
  const k = kind.trim().toLowerCase();
  if (k.startsWith("call.")) return "call";
  if (k.startsWith("comment.")) return "comment";
  if (k.startsWith("booking.")) return "booking";
  if (k.startsWith("ai.")) return "ai";
  return "system";
}

export function structuredTypeLabel(kind: string): string {
  if (TYPE_LABELS[kind]) return TYPE_LABELS[kind];
  const head = kind.split(".")[0]?.toLowerCase() ?? "";
  if (head === "call") return "Call";
  if (head === "lead") return "Lead";
  if (head === "view") return "Privacy";
  if (head === "sv") return "Site visit";
  if (head === "comment") return "Comment";
  return "Activity";
}
