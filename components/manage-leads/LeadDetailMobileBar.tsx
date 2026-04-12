"use client";

import Image from "next/image";
import type { LeadRow } from "@/lib/leads-sample-data";
import { formatIsoDateDisplay, formatLudDisplay } from "@/lib/lead-formatters";
import { MdAdd, MdKeyboardArrowDown } from "react-icons/md";

function assignedLabel(lead: LeadRow) {
  return lead.assignedDisplayName ?? lead.assignedTitle ?? lead.assigned;
}

/** Compact strip when the left rail is hidden (mobile). */
export function LeadDetailMobileBar({ lead }: { lead: LeadRow }) {
  const createLabel = formatIsoDateDisplay(lead.createDate);
  const updateLabel = formatLudDisplay(lead.lud);

  return (
    <div className="shrink-0 border-b border-slate-200/80 bg-white px-3 py-2.5 md:hidden">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#34369C] bg-white py-2.5 font-outfit text-sm font-medium text-[#34369C] shadow-sm transition-colors hover:bg-[#f8f9ff]"
      >
        <Image src="/assets/images/editBluePencilIcon.svg" alt="" width={18} height={18} />
        Edit lead form
      </button>

      <div className="mt-2.5">
        <p className="font-outfit text-[10px] font-semibold tracking-wider text-[#8b87a8] uppercase">Project</p>
        <p className="truncate font-outfit text-sm font-medium text-[#1F1750]">{lead.project}</p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e0e3ee] bg-[#f4f5fc] px-2.5 font-outfit text-xs font-medium text-[#1F1750]"
        >
          <span className="relative block h-3.5 w-3.5 shrink-0">
            <Image src="/assets/images/call.svg" alt="" fill className="object-contain" sizes="14px" />
          </span>
          Call
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e0e3ee] bg-[#f4f5fc] px-2.5 font-outfit text-xs font-medium text-[#1F1750]"
        >
          <span className="relative block h-3.5 w-3.5 shrink-0">
            <Image src="/assets/images/whatsApp.svg" alt="" fill className="object-contain" sizes="14px" />
          </span>
          Chat
        </button>
        <button
          type="button"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e0e3ee] bg-[#f4f5fc] px-2.5 font-outfit text-xs font-medium text-[#1F1750]"
        >
          <span className="relative block h-3.5 w-3.5 shrink-0">
            <Image src="/assets/images/fe_comment.svg" alt="" fill className="object-contain" sizes="14px" />
          </span>
          Comment
        </button>
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
