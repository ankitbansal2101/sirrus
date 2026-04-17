"use client";

import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import type { LeadRow } from "@/lib/leads-sample-data";
import { formatIsoDateDisplay, formatLudDisplay } from "@/lib/lead-formatters";
import { MdAdd, MdKeyboardArrowDown } from "react-icons/md";

function assignedLabel(lead: LeadRow) {
  return lead.assignedDisplayName ?? lead.assignedTitle ?? lead.assigned;
}

/** Compact strip when the left rail is hidden (mobile). */
export function LeadDetailMobileBar({
  lead,
  onEditLead,
}: {
  lead: LeadRow;
  onEditLead?: () => void;
}) {
  const createLabel = formatIsoDateDisplay(lead.createDate);
  const updateLabel = formatLudDisplay(lead.lud);

  return (
    <div className="shrink-0 border-b border-slate-200/80 bg-white px-3 py-2.5 md:hidden">
      <button
        type="button"
        onClick={() => onEditLead?.()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#34369C] bg-white py-2.5 font-outfit text-sm font-medium text-[#34369C] shadow-sm transition-colors hover:bg-[#f8f9ff]"
      >
        <Image src="/assets/images/editBluePencilIcon.svg" alt="" width={18} height={18} />
        Edit lead form
      </button>

      <div className="mt-2.5">
        <p className="font-outfit text-[10px] font-semibold tracking-wider text-[#8b87a8] uppercase">Project</p>
        <p className="truncate font-outfit text-sm font-medium text-[#1F1750]">{lead.project}</p>
      </div>

      <div className="my-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-row flex-wrap items-center gap-4">
          <button
            type="button"
            className="relative flex h-9 w-fit cursor-pointer flex-row items-center overflow-visible rounded-xl border border-solid pt-2 pb-2 pl-2.5 pr-3 font-outfit transition-opacity hover:opacity-95 active:opacity-90"
            style={{
              backgroundColor: "rgb(229, 230, 241)",
              borderColor: "rgb(205, 205, 220)",
            }}
          >
            <span className="relative h-4 w-4 shrink-0">
              <Image src="/assets/images/call.svg" alt="Call" fill className="object-contain" sizes="16px" />
            </span>
            <span className="ml-2 text-[0.75rem]" style={{ color: "rgb(31, 23, 80)" }}>
              Call
            </span>
          </button>
          <button
            type="button"
            aria-label="Chat on WhatsApp"
            className="relative flex h-9 w-fit cursor-pointer flex-row items-center overflow-visible rounded-xl border border-solid pt-2 pb-2 pl-2.5 pr-3 font-outfit transition-opacity hover:opacity-95 active:opacity-90"
            style={{
              backgroundColor: "rgb(229, 230, 241)",
              borderColor: "rgb(205, 205, 220)",
            }}
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
              <FaWhatsapp size={16} style={{ color: "#25D366" }} />
            </span>
            <span className="ml-2 text-[0.75rem]" style={{ color: "rgb(31, 23, 80)" }}>
              Chat
            </span>
          </button>
          <button
            type="button"
            className="relative flex h-9 w-fit cursor-pointer flex-row items-center overflow-visible rounded-xl border border-solid pt-2 pb-2 pl-2.5 pr-3 font-outfit transition-opacity hover:opacity-95 active:opacity-90"
            style={{
              backgroundColor: "rgb(229, 230, 241)",
              borderColor: "rgb(205, 205, 220)",
            }}
          >
            <span className="relative h-4 w-4 shrink-0">
              <Image src="/assets/images/fe_comment.svg" alt="Add comment" fill className="object-contain" sizes="16px" />
            </span>
            <span className="ml-2 text-[0.75rem]" style={{ color: "rgb(31, 23, 80)" }}>
              Add comment
            </span>
          </button>
        </div>
        <button
          type="button"
          className="ml-auto flex max-w-[9rem] items-center gap-0.5 truncate rounded-full border border-[#e8eaf2] bg-white px-2 py-1 font-outfit text-xs font-medium text-[#1F1750]"
        >
          <span className="truncate">{assignedLabel(lead)}</span>
          <MdKeyboardArrowDown size={18} className="shrink-0 text-[#8b87a8]" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 font-outfit text-[10px] text-[#8b87a8]">
        <span className="tabular-nums">
          <span className="font-semibold text-[#5c5878]">Created</span> · {createLabel}
        </span>
        <span className="tabular-nums">
          <span className="font-semibold text-[#5c5878]">Updated</span> · {updateLabel}
        </span>
        <span>
          <span className="font-semibold text-[#5c5878]">Source</span> · {lead.source}
        </span>
      </div>

      <button
        type="button"
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#c8c9d8] py-1.5 font-outfit text-xs text-[#5c5878]"
      >
        <MdAdd size={18} className="text-[#34369C]" />
        Assign project
      </button>
    </div>
  );
}
