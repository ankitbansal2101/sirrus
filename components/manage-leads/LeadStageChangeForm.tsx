"use client";

import { useEffect, useMemo, useState } from "react";
import { normalizeToPipelineStageId } from "@/lib/lead-stage-options";
import type { LeadRow } from "@/lib/leads-sample-data";
import { MdAccessTime, MdCalendarToday, MdCheck } from "react-icons/md";
import { LeadStagePills } from "./LeadStagePills";

const REMARKS_MAX = 5000;

type Props = {
  lead: LeadRow;
  initialStage: string;
  onCancel: () => void;
  onSave: (stage: string, payload: { remarks: string; followUpDate: string; followUpTime: string }) => void;
};

export function LeadStageChangeForm({ lead, initialStage, onCancel, onSave }: Props) {
  const [selectedStage, setSelectedStage] = useState(() => normalizeToPipelineStageId(initialStage));
  const [remarks, setRemarks] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");

  useEffect(() => {
    setSelectedStage(normalizeToPipelineStageId(initialStage));
  }, [initialStage]);

  const remarksLen = remarks.length;
  const canSave = useMemo(
    () =>
      selectedStage.trim() !== "" &&
      remarks.trim() !== "" &&
      followUpDate !== "" &&
      followUpTime !== "",
    [selectedStage, remarks, followUpDate, followUpTime],
  );

  return (
    <div className="rounded-xl border border-slate-200/60 bg-[#fafbff] p-5 sm:p-6">
      <p className="mb-5 font-outfit text-sm leading-relaxed text-[#8b87a8]">
        <span className="font-semibold text-[#5c5878]">{lead.name}</span> · {lead.leadId}. Add remarks and schedule a
        follow-up before saving.
      </p>

      <div className="space-y-6 rounded-xl border border-slate-200/50 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-3 block font-outfit text-sm font-semibold text-[#1F1750]">
            Status <span className="text-red-600">*</span>
          </label>
          <LeadStagePills currentStage={selectedStage} onSelect={setSelectedStage} showHeading={false} />
        </div>

        <div>
          <label htmlFor="stage-remarks" className="mb-2 block font-outfit text-sm font-semibold text-[#1F1750]">
            Remarks <span className="text-red-600">*</span>
          </label>
          <textarea
            id="stage-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value.slice(0, REMARKS_MAX))}
            rows={5}
            placeholder="Add remarks for this stage change…"
            className="w-full resize-y rounded-xl border border-slate-200/80 bg-[#f8f9fc] px-3 py-3 font-outfit text-sm text-[#1F1750] placeholder:text-[#a8a4b8] focus:border-[#34369C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#34369C]/15"
          />
          <p className="mt-1.5 text-end font-outfit text-xs text-[#8b87a8]">
            {remarksLen} / {REMARKS_MAX}
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-outfit text-sm font-semibold text-[#1F1750]">Add follow-up</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="followup-date" className="mb-2 block font-outfit text-xs font-semibold text-[#5c5878]">
                Select date <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <MdCalendarToday
                  className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-[#8b87a8]"
                  size={20}
                  aria-hidden
                />
                <input
                  id="followup-date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-[#f8f9fc] py-3 pr-3 pl-11 font-outfit text-sm text-[#1F1750] focus:border-[#34369C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#34369C]/15"
                />
              </div>
            </div>
            <div>
              <label htmlFor="followup-time" className="mb-2 block font-outfit text-xs font-semibold text-[#5c5878]">
                Select time <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <MdAccessTime
                  className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-[#8b87a8]"
                  size={20}
                  aria-hidden
                />
                <input
                  id="followup-time"
                  type="time"
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-[#f8f9fc] py-3 pr-3 pl-11 font-outfit text-sm text-[#1F1750] focus:border-[#34369C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#34369C]/15"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border-2 border-[#34369C] bg-white px-8 py-3 font-outfit text-sm font-semibold text-[#34369C] transition-colors hover:bg-[#f8f9ff]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSave(selectedStage, {
                remarks: remarks.trim(),
                followUpDate,
                followUpTime,
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#34369C] px-8 py-3 font-outfit text-sm font-semibold text-white shadow-md shadow-[#34369C]/25 transition-colors hover:bg-[#2d2f85] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            <MdCheck size={22} aria-hidden />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
