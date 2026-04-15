/** Configurable summary fields in the lead detail left rail (below quick actions). */

export type LeftRailFieldId =
  | "phone"
  | "alternate"
  | "email"
  | "source"
  | "subSource"
  | "interestedIn"
  | "budget"
  | "leadOwner"
  | "assigned"
  | "created"
  | "lastUpdated"
  | "siteVisit"
  | "siteRevisit";

export const LEFT_RAIL_FIELD_DEFINITIONS: { id: LeftRailFieldId; label: string; hint?: string }[] = [
  { id: "phone", label: "Phone" },
  { id: "alternate", label: "Alternate" },
  { id: "email", label: "Email" },
  { id: "source", label: "Source" },
  { id: "subSource", label: "Sub source" },
  { id: "interestedIn", label: "Interested in" },
  { id: "budget", label: "Budget" },
  { id: "leadOwner", label: "Lead owner" },
  { id: "assigned", label: "Assigned" },
  { id: "created", label: "Created", hint: "Read-only" },
  { id: "lastUpdated", label: "Last updated", hint: "Read-only" },
  { id: "siteVisit", label: "Site visit", hint: "Read-only" },
  { id: "siteRevisit", label: "Site revisit", hint: "Read-only" },
];

export const DEFAULT_LEFT_RAIL_FIELD_ORDER: LeftRailFieldId[] = LEFT_RAIL_FIELD_DEFINITIONS.map((d) => d.id);

const VALID = new Set<LeftRailFieldId>(DEFAULT_LEFT_RAIL_FIELD_ORDER);

export function isLeftRailFieldId(s: string): s is LeftRailFieldId {
  return VALID.has(s as LeftRailFieldId);
}

export function normalizeLeftRailFieldOrder(ids: unknown): LeftRailFieldId[] {
  if (!Array.isArray(ids)) return [...DEFAULT_LEFT_RAIL_FIELD_ORDER];
  const seen = new Set<LeftRailFieldId>();
  const out: LeftRailFieldId[] = [];
  for (const raw of ids) {
    if (typeof raw !== "string" || !isLeftRailFieldId(raw) || seen.has(raw)) continue;
    seen.add(raw);
    out.push(raw);
  }
  if (out.length === 0) return [...DEFAULT_LEFT_RAIL_FIELD_ORDER];
  return out;
}

/** Full permutation of all fields: user order first, then any missing ids in default order. */
export function normalizeFullFieldOrder(ids: unknown): LeftRailFieldId[] {
  const base = [...DEFAULT_LEFT_RAIL_FIELD_ORDER];
  if (!Array.isArray(ids)) return base;
  const seen = new Set<LeftRailFieldId>();
  const out: LeftRailFieldId[] = [];
  for (const raw of ids) {
    if (typeof raw !== "string" || !isLeftRailFieldId(raw) || seen.has(raw)) continue;
    seen.add(raw);
    out.push(raw);
  }
  for (const id of base) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}

export function normalizeHiddenIds(raw: unknown, orderedIds: LeftRailFieldId[]): LeftRailFieldId[] {
  const allowed = new Set(orderedIds);
  if (!Array.isArray(raw)) return [];
  const out: LeftRailFieldId[] = [];
  const seen = new Set<LeftRailFieldId>();
  for (const x of raw) {
    if (typeof x !== "string" || !isLeftRailFieldId(x) || !allowed.has(x) || seen.has(x)) continue;
    seen.add(x);
    out.push(x);
  }
  return out;
}
