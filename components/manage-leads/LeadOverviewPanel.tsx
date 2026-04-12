"use client";

import type { ReactNode } from "react";
import { getLeadOverviewValues } from "@/lib/lead-overview-model";
import type { LeadRow } from "@/lib/leads-sample-data";
import { FiHome, FiInfo, FiUser } from "react-icons/fi";

const LABEL = "text-xs font-medium uppercase tracking-[0.6px] mb-2";
const VALUE = "text-[15px] font-medium leading-normal";
const MUTED = { color: "rgb(126, 122, 149)" };
const TEXT = { color: "rgb(31, 23, 80)" };
const ICON = { color: "rgb(52, 54, 156)" };
const CARD = { backgroundColor: "rgb(241, 243, 252)" };

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

export function LeadOverviewPanel({ lead }: { lead: LeadRow }) {
  const v = getLeadOverviewValues(lead);

  return (
    <div className="w-full overflow-y-auto p-3" style={{ backgroundColor: "rgb(250, 250, 250)" }}>
      <Section title="Lead Info" icon={<FiUser size={18} strokeWidth={2} />}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
          <Field label="Full Name" value={v.fullName} />
          <Field label="Project Name" value={v.projectName} />
          <Field label="Source" value={v.source} />
          <Field label="Sub Source" value={v.subSource} />
          <Field label="WhatsApp Number" value={v.whatsapp} />
          <Field label="Alternate Number" value={v.alternateNumber} />
          <Field label="Email ID" value={v.email} />
          <Field label="Assigned To" value={v.assignedTo} />
          <Field label="Budget Range" value={v.budgetRange} />
          <Field label="Age" value={v.age} />
          <Field label="Gender" value={v.gender} />
          <Field label="Occupation" value={v.occupation} />
          <Field label="Qualification" value={v.qualification} />
          <Field label="Funding Source" value={v.fundingSource} />
          <Field label="Company Name" value={v.companyName} />
          <Field label="State" value={v.state} />
          <Field label="City" value={v.city} />
          <Field label="Region" value={v.region} />
          <Field label="Designation" value={v.designation} />
        </div>
      </Section>

      <Section title="Property Preferences" icon={<FiHome size={18} strokeWidth={2} />}>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
          <Field label="Preferred Unit Type" value={v.preferredUnitType} />
          <Field label="Max Budget" value={v.maxBudget} />
          <Field label="Property Status" value={v.propertyStatus} />
          <Field label="Purpose" value={v.purpose} />
          <Field label="Preferred Location" value={v.preferredLocation} />
          <Field label="Other Preferences" value={v.otherPreferences} />
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
