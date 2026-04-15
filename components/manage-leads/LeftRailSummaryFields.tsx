"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { formatIsoDateDisplay, formatLudDisplay } from "@/lib/lead-formatters";
import {
  LEAD_PREFERRED_UNIT_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  selectOptionsWithValue,
} from "@/lib/lead-field-options";
import { getLeadOverviewValues } from "@/lib/lead-overview-model";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import { EditableLeadSummaryField, emptyToDash } from "./EditableLeadSummaryField";

function assignedLabel(lead: { assignedDisplayName?: string; assignedTitle?: string; assigned: string }) {
  return lead.assignedDisplayName ?? lead.assignedTitle ?? lead.assigned;
}

function phoneDisplay(whatsapp: string) {
  if (whatsapp.startsWith("+")) return whatsapp;
  if (whatsapp === "-" || !whatsapp) return "-";
  return `+91-${whatsapp}`;
}

function FieldRowReadOnly({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-200/50 px-3 py-3 last:border-b-0 sm:grid-cols-[minmax(6rem,34%)_1fr_auto] sm:items-start sm:gap-x-3 sm:gap-y-0">
      <span className="font-outfit text-[11px] font-semibold tracking-wide text-[#9c98b0] sm:pt-0.5">
        {label}
      </span>
      <div className="flex min-w-0 items-start justify-between gap-2 sm:contents">
        <div className="min-w-0 flex-1 font-outfit text-[13px] leading-relaxed font-medium text-[#1F1750] sm:min-w-0">
          {children}
        </div>
        <span className="flex w-7 shrink-0 self-start pt-0.5 sm:pt-1" aria-hidden>
          <Image src="/assets/images/editBluePencilIcon.svg" alt="" width={12} height={12} className="opacity-25" />
        </span>
      </div>
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
  const o = getLeadOverviewValues(lead);
  const lud = formatLudDisplay(lead.lud);
  const createLabel = formatIsoDateDisplay(lead.createDate);
  const sourceOptions = selectOptionsWithValue([...LEAD_SOURCE_OPTIONS], lead.source || "-");
  const unitOptions = selectOptionsWithValue([...LEAD_PREFERRED_UNIT_OPTIONS], lead.preferredUnit || "-");

  const byId = (id: LeftRailFieldId): ReactNode => {
    switch (id) {
      case "phone":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Phone"
            lead={lead}
            kind="tel"
            getDraftValue={whatsappDigitsDraft}
            buildPatch={(d) => ({
              whatsapp: d.replace(/\D/g, "").slice(0, 12) || "-",
            })}
            renderDisplay={(l) => phoneDisplay(l.whatsapp)}
            onPatchLead={onPatchLead}
          />
        );
      case "alternate":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Alternate"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.altNumber === "-" ? "" : l.altNumber)}
            buildPatch={(d) => ({ altNumber: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).alternateNumber}
            onPatchLead={onPatchLead}
          />
        );
      case "email":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Email"
            lead={lead}
            kind="email"
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
          />
        );
      case "source":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Source"
            lead={lead}
            kind="select"
            options={sourceOptions}
            getDraftValue={(l) => l.source || "-"}
            buildPatch={(d) => ({ source: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).source}
            onPatchLead={onPatchLead}
          />
        );
      case "subSource":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Sub source"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.subSource === "-" ? "" : l.subSource)}
            buildPatch={(d) => ({ subSource: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).subSource}
            onPatchLead={onPatchLead}
          />
        );
      case "interestedIn":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Interested in"
            lead={lead}
            kind="select"
            options={unitOptions}
            getDraftValue={(l) => l.preferredUnit || "-"}
            buildPatch={(d) => ({ preferredUnit: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).preferredUnitType}
            onPatchLead={onPatchLead}
          />
        );
      case "budget":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Budget"
            lead={lead}
            kind="text"
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
          />
        );
      case "leadOwner":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Lead owner"
            lead={lead}
            kind="text"
            getDraftValue={(l) => {
              if (l.assignedTitle && l.assignedTitle !== "-") return l.assignedTitle;
              if (l.assignedDisplayName && l.assignedDisplayName !== "-") return l.assignedDisplayName;
              return l.assigned === "-" ? "" : l.assigned;
            }}
            buildPatch={(d) => ({ assignedTitle: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).assignedTo}
            onPatchLead={onPatchLead}
          />
        );
      case "assigned":
        return (
          <EditableLeadSummaryField
            key={id}
            label="Assigned"
            lead={lead}
            kind="text"
            getDraftValue={(l) => {
              const v = l.assignedDisplayName ?? l.assignedTitle ?? l.assigned;
              return v === "-" ? "" : v;
            }}
            buildPatch={(d) => ({ assignedDisplayName: emptyToDash(d) })}
            renderDisplay={(l) => <span className="truncate">{assignedLabel(l)}</span>}
            onPatchLead={onPatchLead}
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
          <FieldRowReadOnly key={id} label="Last updated">
            {lud}
          </FieldRowReadOnly>
        );
      case "siteVisit":
        return (
          <FieldRowReadOnly key={id} label="Site visit">
            {o.siteVisitScheduled}
          </FieldRowReadOnly>
        );
      case "siteRevisit":
        return (
          <FieldRowReadOnly key={id} label="Site revisit">
            {o.revisitScheduled}
          </FieldRowReadOnly>
        );
      default:
        return null;
    }
  };

  return <>{fieldIds.map((id) => byId(id))}</>;
}
