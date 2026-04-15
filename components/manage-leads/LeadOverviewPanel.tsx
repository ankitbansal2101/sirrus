"use client";

import type { ReactNode } from "react";
import {
  LEAD_FUNDING_OPTIONS,
  LEAD_GENDER_OPTIONS,
  LEAD_PREFERRED_UNIT_OPTIONS,
  LEAD_PROPERTY_STATUS_OPTIONS,
  LEAD_PURPOSE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  selectOptionsWithValue,
} from "@/lib/lead-field-options";
import { getLeadOverviewValues } from "@/lib/lead-overview-model";
import type { LeadRow } from "@/lib/leads-sample-data";
import { FiEdit2, FiHome, FiInfo, FiUser } from "react-icons/fi";
import { EditableLeadSummaryField, emptyToDash } from "./EditableLeadSummaryField";

const LABEL = "text-xs font-medium uppercase tracking-[0.6px] mb-2";
const VALUE = "text-[15px] font-medium leading-normal";
const MUTED = { color: "rgb(126, 122, 149)" };
const TEXT = { color: "rgb(31, 23, 80)" };
const ICON = { color: "rgb(52, 54, 156)" };
const CARD = { backgroundColor: "rgb(241, 243, 252)" };

function whatsappDigitsDraft(l: LeadRow) {
  const d = l.whatsapp.replace(/\D/g, "");
  if (d.length <= 10) return d;
  if (d.startsWith("91") && d.length >= 12) return d.slice(-10);
  return d.slice(-10);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="col-span-1">
      <div className="flex flex-col">
        <span className={LABEL} style={MUTED}>
          {label}
        </span>
        <span className={VALUE} style={TEXT}>
          {value}
        </span>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-6 rounded-xl p-3 py-8" style={CARD}>
      <div className="mb-8 flex items-center gap-2">
        <span style={ICON}>{icon}</span>
        <h3 className="text-xl font-semibold" style={TEXT}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function LeadOverviewPanel({
  lead,
  onEditLead,
  onPatchLead,
}: {
  lead: LeadRow;
  onEditLead?: () => void;
  onPatchLead?: (patch: Partial<LeadRow>) => void;
}) {
  const v = getLeadOverviewValues(lead);

  const sourceOptions = selectOptionsWithValue([...LEAD_SOURCE_OPTIONS], lead.source || "-");
  const unitOptions = selectOptionsWithValue([...LEAD_PREFERRED_UNIT_OPTIONS], lead.preferredUnit || "-");
  const propertyStatusOptions = selectOptionsWithValue(
    [...LEAD_PROPERTY_STATUS_OPTIONS],
    lead.propertyStatus || "-",
  );
  const purposeOptions = selectOptionsWithValue([...LEAD_PURPOSE_OPTIONS], lead.purpose || "-");
  const fundingOptions = selectOptionsWithValue([...LEAD_FUNDING_OPTIONS], lead.funding || "-");
  const genderOptions = selectOptionsWithValue([...LEAD_GENDER_OPTIONS], lead.gender || "-");

  return (
    <div className="w-full overflow-y-auto p-3" style={{ backgroundColor: "rgb(250, 250, 250)" }}>
      {onEditLead ? (
        <div
          className="sticky top-0 z-10 -mx-3 mb-4 flex justify-end border-b px-3 py-2"
          style={{ backgroundColor: "rgb(250, 250, 250)", borderColor: "rgb(228, 229, 230)" }}
        >
          <button
            type="button"
            onClick={onEditLead}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "rgb(52, 54, 156)" }}
          >
            <FiEdit2 size={16} strokeWidth={2} aria-hidden />
            Edit lead
          </button>
        </div>
      ) : null}
      <Section title="Lead Info" icon={<FiUser size={18} strokeWidth={2} />}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
          <EditableLeadSummaryField
            variant="stacked"
            label="Full Name"
            lead={lead}
            kind="text"
            getDraftValue={(l) => l.name}
            buildPatch={(d, l) => ({ name: d.trim() || l.name })}
            renderDisplay={(l) => getLeadOverviewValues(l).fullName}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Project Name"
            lead={lead}
            kind="text"
            getDraftValue={(l) => l.project}
            buildPatch={(d, l) => ({ project: d.trim() || l.project })}
            renderDisplay={(l) => getLeadOverviewValues(l).projectName}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Source"
            lead={lead}
            kind="select"
            options={sourceOptions}
            getDraftValue={(l) => l.source || "-"}
            buildPatch={(d) => ({ source: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).source}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Sub Source"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.subSource === "-" ? "" : l.subSource)}
            buildPatch={(d) => ({ subSource: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).subSource}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="WhatsApp Number"
            lead={lead}
            kind="tel"
            getDraftValue={whatsappDigitsDraft}
            buildPatch={(d) => ({
              whatsapp: d.replace(/\D/g, "").slice(0, 12) || "-",
            })}
            renderDisplay={(l) => getLeadOverviewValues(l).whatsapp}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Alternate Number"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.altNumber === "-" ? "" : l.altNumber)}
            buildPatch={(d) => ({ altNumber: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).alternateNumber}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Email ID"
            lead={lead}
            kind="email"
            getDraftValue={(l) => (l.email === "-" ? "" : l.email)}
            buildPatch={(d) => ({ email: emptyToDash(d) })}
            renderDisplay={(l) => {
              const ov = getLeadOverviewValues(l);
              return ov.email;
            }}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Assigned To"
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
          <EditableLeadSummaryField
            variant="stacked"
            label="Budget Range"
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
          <EditableLeadSummaryField
            variant="stacked"
            label="Age"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.age === "-" ? "" : l.age)}
            buildPatch={(d) => ({ age: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).age}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Gender"
            lead={lead}
            kind="select"
            options={genderOptions}
            getDraftValue={(l) => l.gender || "-"}
            buildPatch={(d) => ({ gender: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).gender}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Occupation"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.occupation === "-" ? "" : l.occupation)}
            buildPatch={(d) => ({ occupation: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).occupation}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Qualification"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.qualification === "-" ? "" : l.qualification)}
            buildPatch={(d) => ({ qualification: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).qualification}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Funding Source"
            lead={lead}
            kind="select"
            options={fundingOptions}
            getDraftValue={(l) => l.funding || "-"}
            buildPatch={(d) => ({ funding: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).fundingSource}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Company Name"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.company === "-" ? "" : l.company)}
            buildPatch={(d) => ({ company: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).companyName}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="State"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.state === "-" ? "" : l.state)}
            buildPatch={(d) => ({ state: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).state}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="City"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.city === "-" ? "" : l.city)}
            buildPatch={(d) => ({ city: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).city}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Region"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.region === "-" ? "" : l.region)}
            buildPatch={(d) => ({ region: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).region}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Designation"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.designation === "-" ? "" : l.designation)}
            buildPatch={(d) => ({ designation: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).designation}
            onPatchLead={onPatchLead}
          />
        </div>
      </Section>

      <Section title="Property Preferences" icon={<FiHome size={18} strokeWidth={2} />}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
          <EditableLeadSummaryField
            variant="stacked"
            label="Preferred Unit Type"
            lead={lead}
            kind="select"
            options={unitOptions}
            getDraftValue={(l) => l.preferredUnit || "-"}
            buildPatch={(d) => ({ preferredUnit: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).preferredUnitType}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Max Budget"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.maxBudget === "-" ? "" : l.maxBudget)}
            buildPatch={(d) => ({ maxBudget: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).maxBudget}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Property Status"
            lead={lead}
            kind="select"
            options={propertyStatusOptions}
            getDraftValue={(l) => l.propertyStatus || "-"}
            buildPatch={(d) => ({ propertyStatus: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).propertyStatus}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Purpose"
            lead={lead}
            kind="select"
            options={purposeOptions}
            getDraftValue={(l) => l.purpose || "-"}
            buildPatch={(d) => ({ purpose: d === "-" ? "-" : d })}
            renderDisplay={(l) => getLeadOverviewValues(l).purpose}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Preferred Location"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.preferredLocation === "-" ? "" : l.preferredLocation)}
            buildPatch={(d) => ({ preferredLocation: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).preferredLocation}
            onPatchLead={onPatchLead}
          />
          <EditableLeadSummaryField
            variant="stacked"
            label="Other Preferences"
            lead={lead}
            kind="text"
            getDraftValue={(l) => (l.otherPrefs === "-" ? "" : l.otherPrefs)}
            buildPatch={(d) => ({ otherPrefs: emptyToDash(d) })}
            renderDisplay={(l) => getLeadOverviewValues(l).otherPreferences}
            onPatchLead={onPatchLead}
          />
        </div>
      </Section>

      <Section title="Other" icon={<FiInfo size={18} strokeWidth={2} />}>
        <div className="space-y-8">
          <div className="w-full">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Unqualified Date" value={v.unqualifiedDate} />
              <Field label="Unqualified Reason" value={v.unqualifiedReason} />
            </div>
          </div>
          <div className="w-full">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Dropped Date" value={v.droppedDate} />
              <Field label="Dropped Reason" value={v.droppedReason} />
            </div>
          </div>
          <div className="w-full">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.6px]" style={MUTED}>
              Site Visit Details
            </h4>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Site visit Scheduled" value={v.siteVisitScheduled} />
              <Field label="Revisit Scheduled" value={v.revisitScheduled} />
              <Field label="Site Visit Done" value={v.siteVisitDone} />
            </div>
          </div>
          <div className="w-full">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.6px]" style={MUTED}>
              Revisits Done
            </h4>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3" />
          </div>
        </div>
      </Section>
    </div>
  );
}
