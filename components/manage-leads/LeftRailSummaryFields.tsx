"use client";

import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { formatIsoDateDisplay, formatLudDisplay } from "@/lib/lead-formatters";
import {
  LEAD_PREFERRED_UNIT_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  selectOptionsWithValue,
} from "@/lib/lead-field-options";
import { getLeadOverviewValues } from "@/lib/lead-overview-model";
import {
  isLeftRailFieldRequiredInLeadForm,
  LEAD_FORM_REQUIRED_ASTERISK_COLOR,
  leftRailBulkSaveFieldErrors,
  type LeftRailBulkFieldErrors,
  type LeftRailFieldId,
} from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import { EditableLeadSummaryField, emptyToDash } from "./EditableLeadSummaryField";

function assignedLabel(lead: { assignedDisplayName?: string; assignedTitle?: string; assigned: string }) {
  return lead.assignedDisplayName ?? lead.assignedTitle ?? lead.assigned;
}

const EDITABLE_LEFT_RAIL_IDS: LeftRailFieldId[] = [
  "phone",
  "alternate",
  "email",
  "source",
  "subSource",
  "interestedIn",
  "budget",
  "leadOwner",
  "assigned",
];

function FieldRowReadOnly({
  label,
  labelRequired,
  children,
}: {
  label: string;
  labelRequired?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-200/50 px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(6rem,34%)_1fr] sm:items-start sm:gap-x-3 sm:gap-y-0">
      <span
        className="font-outfit text-[11px] font-semibold tracking-wide sm:pt-1"
        style={{ color: "rgb(126, 122, 149)" }}
      >
        {label}
        {labelRequired ? (
          <span style={{ color: LEAD_FORM_REQUIRED_ASTERISK_COLOR }}>
            {" "}
            *{" "}
          </span>
        ) : null}
      </span>
      <div className="min-w-0 font-outfit text-[13px] leading-relaxed font-medium text-[#1F1750]">{children}</div>
    </div>
  );
}

function whatsappDigitsDraft(lead: LeadRow) {
  const d = lead.whatsapp.replace(/\D/g, "");
  if (d.length <= 10) return d;
  if (d.startsWith("91") && d.length >= 12) return d.slice(-10);
  return d.slice(-10);
}

type Props = {
  lead: LeadRow;
  fieldIds: LeftRailFieldId[];
  onPatchLead?: (patch: Partial<LeadRow>) => void;
};

export function LeftRailSummaryFields({ lead, fieldIds, onPatchLead }: Props) {
  const [bulkEditing, setBulkEditing] = useState(false);
  const [bulkFieldErrors, setBulkFieldErrors] = useState<LeftRailBulkFieldErrors>({});
  const [railSensitiveUnlock, setRailSensitiveUnlock] = useState({ phone: false, email: false });
  const bulkSaversRef = useRef<Map<string, () => Partial<LeadRow>>>(new Map());

  const registerRailBulkSaver = useCallback((key: string, getPatch: () => Partial<LeadRow>) => {
    bulkSaversRef.current.set(key, getPatch);
    return () => {
      bulkSaversRef.current.delete(key);
    };
  }, []);

  const handleBulkSave = useCallback(() => {
    const patch: Partial<LeadRow> = {};
    for (const id of fieldIds) {
      const fn = bulkSaversRef.current.get(id);
      if (fn) Object.assign(patch, fn());
    }
    const merged = { ...lead, ...patch } as LeadRow;
    const fieldErrors = leftRailBulkSaveFieldErrors(merged, fieldIds, lead);
    if (Object.keys(fieldErrors).length > 0) {
      setBulkFieldErrors({ ...fieldErrors });
      return;
    }
    setBulkFieldErrors({});
    onPatchLead?.(patch);
    setRailSensitiveUnlock({ phone: false, email: false });
    setBulkEditing(false);
  }, [fieldIds, lead, onPatchLead]);

  const handleBulkCancel = useCallback(() => {
    setBulkFieldErrors({});
    setRailSensitiveUnlock({ phone: false, email: false });
    setBulkEditing(false);
  }, []);

  const o = getLeadOverviewValues(lead);
  const lud = formatLudDisplay(lead.lud);
  const createLabel = formatIsoDateDisplay(lead.createDate);
  const sourceOptions = selectOptionsWithValue([...LEAD_SOURCE_OPTIONS], lead.source || "-");
  const unitOptions = selectOptionsWithValue([...LEAD_PREFERRED_UNIT_OPTIONS], lead.preferredUnit || "-");

  const hasEditableInRail = fieldIds.some((id) => EDITABLE_LEFT_RAIL_IDS.includes(id));
  const bulkProps =
    onPatchLead && hasEditableInRail
      ? {
          railBulkActive: bulkEditing,
          registerRailBulkSaver,
          onExitRailBulk: handleBulkCancel,
        }
      : {};

  const byId = (id: LeftRailFieldId): ReactNode => {
    switch (id) {
      case "phone":
        return (
          <EditableLeadSummaryField
            key={id}
            label="WhatsApp Number"
            lead={lead}
            kind="tel"
            railFieldKey={id}
            getDraftValue={whatsappDigitsDraft}
            buildPatch={(d) => ({
              whatsapp: d.replace(/\D/g, "").slice(0, 12) || "-",
            })}
            renderDisplay={(l) => getLeadOverviewValues(l).whatsapp}
            onPatchLead={onPatchLead}
            labelRequired={isLeftRailFieldRequiredInLeadForm(id)}
            railBulkInlineError={bulkEditing ? bulkFieldErrors.phone : undefined}
            railSensitiveReadLock
            railBulkSensitiveNeedsUnlock
            railBulkSensitiveUnlocked={railSensitiveUnlock.phone}
            onRailBulkSensitiveUnlock={() => setRailSensitiveUnlock((u) => ({ ...u, phone: true }))}
            {...bulkProps}
          />
        );
      case "alternate":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Alternate"
            lead={lead}
            kind="text"
            railFieldKey={id}
            getDraftValue={(l) => (l.altNumber === "-" ? "" : l.altNumber)}
            buildPatch={(d) => ({ altNumber: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).alternateNumber}
            onPatchLead={onPatchLead}
            labelRequired={isLeftRailFieldRequiredInLeadForm(id)}
            {...bulkProps}
          />
        );
      case "email":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Email"
            lead={lead}
            kind="email"
            railFieldKey={id}
            getDraftValue={(l) => (l.email === "-" ? "" : l.email)}
            buildPatch={(d) => ({ email: emptyToDash(d) })}
            renderDisplay={(l) => {
              const ov = getLeadOverviewValues(l);
              if (ov.email === "-" || l.email === "-") return "-";
              return (
                <a href={`mailto:${l.email}`} className="text-[#34369C] underline-offset-2 hover:underline">
                  {ov.email}
                </a>
              );
            }}
            onPatchLead={onPatchLead}
            labelRequired={isLeftRailFieldRequiredInLeadForm(id)}
            railSensitiveReadLock
            railBulkSensitiveNeedsUnlock
            railBulkSensitiveUnlocked={railSensitiveUnlock.email}
            onRailBulkSensitiveUnlock={() => setRailSensitiveUnlock((u) => ({ ...u, email: true }))}
            railBulkInlineError={bulkEditing ? bulkFieldErrors.email : undefined}
            {...bulkProps}
          />
        );
      case "source":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Source"
            lead={lead}
            kind="select"
            railFieldKey={id}
            options={sourceOptions}
            getDraftValue={(l) => l.source || "-"}
            buildPatch={(d) => ({ source: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).source}
            onPatchLead={onPatchLead}
            labelRequired={isLeftRailFieldRequiredInLeadForm(id)}
            railBulkInlineError={bulkEditing ? bulkFieldErrors.source : undefined}
            {...bulkProps}
          />
        );
      case "subSource":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Sub source"
            lead={lead}
            kind="text"
            railFieldKey={id}
            getDraftValue={(l) => (l.subSource === "-" ? "" : l.subSource)}
            buildPatch={(d) => ({ subSource: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).subSource}
            onPatchLead={onPatchLead}
            labelRequired={isLeftRailFieldRequiredInLeadForm(id)}
            railBulkInlineError={bulkEditing ? bulkFieldErrors.subSource : undefined}
            {...bulkProps}
          />
        );
      case "interestedIn":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Interested in"
            lead={lead}
            kind="select"
            railFieldKey={id}
            options={unitOptions}
            getDraftValue={(l) => l.preferredUnit || "-"}
            buildPatch={(d) => ({ preferredUnit: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).preferredUnitType}
            onPatchLead={onPatchLead}
            labelRequired={isLeftRailFieldRequiredInLeadForm(id)}
            {...bulkProps}
          />
        );
      case "budget":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Budget"
            lead={lead}
            kind="text"
            railFieldKey={id}
            getDraftValue={(l) =>
              l.maxBudget !== "-" ? l.maxBudget : l.budgetRange !== "-" ? l.budgetRange : ""
            }
            buildPatch={(d, l) => {
              const t = d.trim();
              if (!t) return { maxBudget: "-", budgetRange: l.budgetRange };
              return { maxBudget: t, budgetRange: t };
            }}
            renderDisplay={(l) => {
              const ov = getLeadOverviewValues(l);
              return ov.maxBudget !== "-" ? ov.maxBudget : ov.budgetRange;
            }}
            onPatchLead={onPatchLead}
            labelRequired={isLeftRailFieldRequiredInLeadForm(id)}
            {...bulkProps}
          />
        );
      case "leadOwner":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Lead owner"
            lead={lead}
            kind="text"
            railFieldKey={id}
            getDraftValue={(l) => {
              if (l.assignedTitle && l.assignedTitle !== "-") return l.assignedTitle;
              if (l.assignedDisplayName && l.assignedDisplayName !== "-") return l.assignedDisplayName;
              return l.assigned === "-" ? "" : l.assigned;
            }}
            buildPatch={(d) => ({ assignedTitle: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).assignedTo}
            onPatchLead={onPatchLead}
            labelRequired={isLeftRailFieldRequiredInLeadForm(id)}
            {...bulkProps}
          />
        );
      case "assigned":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Assigned"
            lead={lead}
            kind="text"
            railFieldKey={id}
            getDraftValue={(l) => {
              const v = l.assignedDisplayName ?? l.assignedTitle ?? l.assigned;
              return v === "-" ? "" : v;
            }}
            buildPatch={(d) => ({ assignedDisplayName: emptyToDash(d) })}
            renderDisplay={(l) => <span className="truncate">{assignedLabel(l)}</span>}
            onPatchLead={onPatchLead}
            labelRequired={isLeftRailFieldRequiredInLeadForm(id)}
            {...bulkProps}
          />
        );
      case "created":
        return (
          <FieldRowReadOnly key={id} label="Created">
            {createLabel}
          </FieldRowReadOnly>
        );
      case "lastUpdated":
        return (
          <FieldRowReadOnly key={id} label="Last updated" labelRequired={isLeftRailFieldRequiredInLeadForm(id)}>
            {lud}
          </FieldRowReadOnly>
        );
      case "siteVisit":
        return (
          <FieldRowReadOnly key={id} label="Site visit" labelRequired={isLeftRailFieldRequiredInLeadForm(id)}>
            {o.siteVisitScheduled}
          </FieldRowReadOnly>
        );
      case "siteRevisit":
        return (
          <FieldRowReadOnly key={id} label="Site revisit" labelRequired={isLeftRailFieldRequiredInLeadForm(id)}>
            {o.revisitScheduled}
          </FieldRowReadOnly>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-w-0 flex-col">
      {onPatchLead && hasEditableInRail ? (
        <div className="border-b border-slate-200/40">
          <div className="flex items-center justify-end gap-1.5 px-3 py-2">
          {!bulkEditing ? (
            <button
              type="button"
              onClick={() => {
                setBulkFieldErrors({});
                setRailSensitiveUnlock({ phone: false, email: false });
                setBulkEditing(true);
              }}
              title="Edit WhatsApp Number, email, source, and other summary fields"
              aria-label="Edit summary fields inline"
              className="rounded-full px-2 py-0.5 font-outfit text-[10px] font-semibold text-[#34369C] transition-colors hover:bg-[#34369C]/10 sm:text-[11px]"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleBulkCancel}
                className="rounded-full border-2 border-[#34369C] bg-transparent px-2.5 py-0.5 font-outfit text-[10px] font-semibold uppercase tracking-wide text-[#34369C] transition-colors hover:bg-[#34369C]/5 sm:px-3 sm:text-[11px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkSave}
                className="rounded-full bg-[#34369C] px-3 py-0.5 font-outfit text-[10px] font-semibold uppercase tracking-wide text-[#f5f5f5] transition-opacity hover:opacity-95 sm:text-[11px]"
              >
                Save
              </button>
            </>
          )}
          </div>
        </div>
      ) : null}
      <div className="min-w-0">{fieldIds.map((id) => byId(id))}</div>
    </div>
  );
}
