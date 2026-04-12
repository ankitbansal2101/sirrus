"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { formatIsoDateDisplay, formatLudDisplay } from "@/lib/lead-formatters";
import { getLeadOverviewValues } from "@/lib/lead-overview-model";
import { LeadTempBadge } from "@/lib/lead-temp-ring";
import type { LeadRow } from "@/lib/leads-sample-data";
import { stageBg } from "@/lib/leads-sample-data";
import { MdAdd, MdKeyboardArrowDown } from "react-icons/md";

function assignedLabel(lead: { assignedDisplayName?: string; assignedTitle?: string; assigned: string }) {
  return lead.assignedDisplayName ?? lead.assignedTitle ?? lead.assigned;
}

function phoneDisplay(whatsapp: string) {
  if (whatsapp.startsWith("+")) return whatsapp;
  return `+91-${whatsapp}`;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="px-1 pb-2 font-outfit text-[10px] font-semibold tracking-wider text-[#8b87a8] uppercase">
      {children}
    </h3>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[#eef0f7] py-2.5 last:border-b-0">
      <span className="font-outfit text-[11px] font-medium text-[#8b87a8]">{label}</span>
      <div className="font-outfit text-[13px] leading-snug font-medium text-[#1F1750]">{children}</div>
    </div>
  );
}

function FieldCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e2e6f0] bg-white/90 px-3 py-1 shadow-sm">
      <SectionTitle>{title}</SectionTitle>
      <div className="-mx-1">{children}</div>
    </div>
  );
}

export function LeadDetailLeftRail({ lead }: { lead: LeadRow }) {
  const o = getLeadOverviewValues(lead);
  const lud = formatLudDisplay(lead.lud);
  const createLabel = formatIsoDateDisplay(lead.createDate);

  return (
    <aside
      className="flex h-full w-full min-w-0 flex-col bg-gradient-to-b from-[#f8f9fd] via-[#f4f5fa] to-[#eceef6]"
      aria-label="Lead summary"
    >
      <div className="flex-1 overflow-y-auto px-3 pt-4 pb-3 [scrollbar-width:thin]">
        <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_4px_24px_-4px_rgba(31,23,80,0.08)] backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <LeadTempBadge temp={lead.temp} size="sm" />
            <div className="min-w-0 flex-1">
              <h2 className="font-outfit text-[17px] leading-tight font-semibold text-[#1F1750]">{lead.name}</h2>
              <p className="mt-1 font-outfit text-xs tabular-nums text-[#8b87a8]">{lead.leadId}</p>
              <div className="mt-3">
                <span
                  className="inline-flex items-center rounded-lg px-2.5 py-1 font-outfit text-xs font-semibold text-[#1F1750]"
                  style={{ backgroundColor: stageBg(lead.stage) }}
                >
                  {lead.stage}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#34369C] bg-white py-2.5 font-outfit text-sm font-medium text-[#34369C] shadow-sm transition-colors hover:bg-[#f8f9ff]"
          >
            <Image src="/assets/images/editBluePencilIcon.svg" alt="" width={18} height={18} />
            Edit lead form
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-[#e0e3ee] bg-white px-2 font-outfit text-xs font-medium text-[#1F1750] shadow-sm transition-colors hover:border-[#34369C]/25 hover:bg-[#f4f5fc] min-[380px]:flex-none min-[380px]:px-3"
          >
            <span className="relative block h-4 w-4 shrink-0">
              <Image src="/assets/images/call.svg" alt="" fill className="object-contain" sizes="16px" />
            </span>
            Call
          </button>
          <button
            type="button"
            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-xl border border-[#e0e3ee] bg-white px-2 font-outfit text-xs font-medium text-[#1F1750] shadow-sm transition-colors hover:border-[#34369C]/25 hover:bg-[#f4f5fc] min-[380px]:flex-none min-[380px]:px-3"
          >
            <span className="relative block h-4 w-4 shrink-0">
              <Image src="/assets/images/whatsApp.svg" alt="" fill className="object-contain" sizes="16px" />
            </span>
            Chat
          </button>
          <button
            type="button"
            className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-[#e0e3ee] bg-white px-2 font-outfit text-xs font-medium text-[#1F1750] shadow-sm transition-colors hover:border-[#34369C]/25 hover:bg-[#f4f5fc] min-[380px]:w-auto min-[380px]:px-3"
          >
            <span className="relative block h-4 w-4 shrink-0">
              <Image src="/assets/images/fe_comment.svg" alt="" fill className="object-contain" sizes="16px" />
            </span>
            Comment
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <FieldCard title="Project">
            <div className="flex flex-wrap items-center gap-2 px-1 pb-2">
              <div className="min-w-0 max-w-full cursor-pointer rounded-xl border-2 border-[#34369C] bg-[#f8f9ff] px-3 py-2 transition-colors hover:bg-[#f0f2ff]">
                <div className="truncate font-outfit text-sm font-medium text-[#1F1750]">{lead.project}</div>
              </div>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-[#c8c9d8] bg-[#fafbff] px-2.5 py-2 font-outfit text-xs font-medium text-[#5c5878] transition-colors hover:border-[#34369C]/40 hover:text-[#34369C]"
              >
                <MdAdd size={18} className="text-[#34369C]" />
                Assign
              </button>
            </div>
          </FieldCard>

          <FieldCard title="Contact">
            <FieldRow label="Phone">
              <span className="inline-flex items-center gap-2">
                {phoneDisplay(lead.whatsapp)}
                <span className="relative inline-block h-5 w-5 shrink-0 cursor-pointer align-middle opacity-80 hover:opacity-100">
                  <Image src="/assets/images/masked_icon.svg" alt="" fill className="object-contain" sizes="20px" />
                </span>
              </span>
            </FieldRow>
            <FieldRow label="Alternate">{o.alternateNumber}</FieldRow>
            <FieldRow label="Email">
              <a
                href={o.email !== "-" ? `mailto:${lead.email}` : undefined}
                className="text-[#34369C] underline-offset-2 hover:underline"
              >
                {o.email}
              </a>
            </FieldRow>
          </FieldCard>

          <FieldCard title="Source & preference">
            <FieldRow label="Source">{o.source}</FieldRow>
            <FieldRow label="Sub source">{o.subSource}</FieldRow>
            <FieldRow label="Interested in">{o.preferredUnitType}</FieldRow>
            <FieldRow label="Budget">{o.maxBudget !== "-" ? o.maxBudget : o.budgetRange}</FieldRow>
          </FieldCard>

          <FieldCard title="Ownership">
            <FieldRow label="Lead owner">{o.assignedTo}</FieldRow>
            <FieldRow label="Assigned">
              <button
                type="button"
                className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#e8eaf2] bg-white px-2.5 py-1 font-outfit text-[13px] font-medium text-[#1F1750] shadow-sm hover:border-[#d5d9e6]"
              >
                <span className="truncate">{assignedLabel(lead)}</span>
                <MdKeyboardArrowDown size={18} className="shrink-0 text-[#8b87a8]" />
              </button>
            </FieldRow>
            <FieldRow label="Created">{createLabel}</FieldRow>
            <FieldRow label="Last updated">{lud}</FieldRow>
          </FieldCard>

          <FieldCard title="Visits">
            <FieldRow label="Site visit">{o.siteVisitScheduled}</FieldRow>
            <FieldRow label="Site revisit">{o.revisitScheduled}</FieldRow>
          </FieldCard>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#dfe3ee] bg-white/60 px-3 py-3 backdrop-blur-sm">
        <button
          type="button"
          className="w-full rounded-xl bg-[#34369C] py-3 font-outfit text-sm font-semibold text-white shadow-md shadow-[#34369C]/25 transition-colors hover:bg-[#2d2f85] active:bg-[#262876]"
        >
          Send email
        </button>
      </div>
    </aside>
  );
}
