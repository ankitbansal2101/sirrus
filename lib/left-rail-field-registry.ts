/** Configurable summary fields in the lead detail left rail (below quick actions). */

import type { LeadRow } from "@/lib/leads-sample-data";

/** Same red as `AddLeadFormOverlay` `FieldLabel` required asterisk. */
export const LEAD_FORM_REQUIRED_ASTERISK_COLOR = "rgb(255, 102, 120)";

/** Inline copy when a visible required left-rail row is empty or “—” after bulk save. */
export const LEFT_RAIL_BULK_FIELD_MANDATORY_MESSAGE = "This field is mandatory";

/** Shown when the visible phone row maps to WhatsApp and the merged number is not 10 digits. */
export const LEFT_RAIL_BULK_WHATSAPP_INVALID_MESSAGE = "Please enter a valid WhatsApp Number";

/** @deprecated Prefer per-field {@link LEFT_RAIL_BULK_FIELD_MANDATORY_MESSAGE} via {@link leftRailBulkSaveFieldErrors}. */
export const LEFT_RAIL_BULK_REQUIRED_MESSAGE = "Please fill out all mandatory fields";

/**
 * Whether this left-rail row maps to a **required** field on the add/edit lead form
 * (`AddLeadFormOverlay` uses `FieldLabel required` for Full Name, Project, Source, Sub Source, WhatsApp).
 * Here: **WhatsApp Number** ↔ `whatsapp`, **Source**, **Sub source**.
 */
export function isLeftRailFieldRequiredInLeadForm(id: LeftRailFieldId): boolean {
  return id === "phone" || id === "source" || id === "subSource";
}

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

function leftRailWhatsappHasTenDigits(whatsapp: string): boolean {
  const d = whatsapp.replace(/\D/g, "");
  if (d.length === 0) return false;
  const last10 = d.length >= 10 ? d.slice(-10) : d;
  return last10.length === 10;
}

export type LeftRailBulkFieldErrors = Partial<Record<LeftRailFieldId, string>>;

/**
 * After merging a bulk-edit patch into `lead`, returns per-field inline messages for any **visible**
 * required row that is invalid. Empty object means save is allowed.
 *
 * `baseLead` is the row **before** the patch: unchanged non–10-digit values (e.g. masked `XXXXXX4694`)
 * still count as valid so bulk save can update other fields without forcing a full number re-entry.
 */
export function leftRailBulkSaveFieldErrors(
  merged: LeadRow,
  fieldIds: readonly LeftRailFieldId[],
  baseLead: LeadRow,
): LeftRailBulkFieldErrors {
  const out: LeftRailBulkFieldErrors = {};
  for (const id of fieldIds) {
    if (!isLeftRailFieldRequiredInLeadForm(id)) continue;
    if (id === "phone") {
      const w = (merged.whatsapp || "").trim();
      if (!w || w === "-") {
        out.phone = LEFT_RAIL_BULK_FIELD_MANDATORY_MESSAGE;
        continue;
      }
      if (leftRailWhatsappHasTenDigits(merged.whatsapp || "")) continue;
      const prev = (baseLead.whatsapp || "").trim();
      if (prev && prev !== "-" && (merged.whatsapp || "") === (baseLead.whatsapp || "")) continue;
      out.phone = LEFT_RAIL_BULK_WHATSAPP_INVALID_MESSAGE;
      continue;
    }
    if (id === "source") {
      const s = (merged.source || "").trim();
      if (!s || s === "-") out.source = LEFT_RAIL_BULK_FIELD_MANDATORY_MESSAGE;
      continue;
    }
    if (id === "subSource") {
      const s = (merged.subSource || "").trim();
      if (!s || s === "-") out.subSource = LEFT_RAIL_BULK_FIELD_MANDATORY_MESSAGE;
    }
  }
  return out;
}

export const LEFT_RAIL_FIELD_DEFINITIONS: { id: LeftRailFieldId; label: string; hint?: string }[] = [
  { id: "phone", label: "WhatsApp Number" },
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
