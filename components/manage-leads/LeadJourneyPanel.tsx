"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JourneyEvent } from "@/lib/lead-journey-types";
import { getJourneyForLead } from "@/lib/lead-journey-sample-data";
import {
  filterJourneyDays,
  JOURNEY_FILTER_OPTIONS,
  type JourneyCategory,
} from "@/lib/journey-categories";
import type { LeadRow } from "@/lib/leads-sample-data";
import { FaPen } from "react-icons/fa";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

const GRADIENT_BORDER =
  "linear-gradient(90deg, rgb(10, 216, 234), rgb(98, 48, 201), rgb(230, 128, 178))";
const AI_LABEL_GRADIENT =
  "linear-gradient(90deg, rgb(14, 184, 249), rgb(95, 52, 254), rgb(165, 70, 217), rgb(232, 128, 172))";

function JourneyNote({ text, compact }: { text: string; compact?: boolean }) {
  const mb = compact ? "mb-3" : "mb-5";
  return (
    <div className={`relative pl-6 ${mb}`}>
      <div className="flex w-full items-center justify-center">
        <div
          className={`rounded-[100px] px-6 py-[6px] text-center font-outfit text-[12px] font-medium ${compact ? "max-w-full" : "w-[320px]"}`}
          style={{ backgroundColor: "#EEEFF0", color: "#7E7A95" }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function JourneyBooking({ rows, compact }: { rows: { label: string; value: string }[]; compact?: boolean }) {
  const mb = compact ? "mb-3" : "mb-5";
  return (
    <div className={`relative pl-6 ${mb}`}>
      <div className="rounded-[16px] p-4" style={{ backgroundColor: "#EFEFF1" }}>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className={`flex items-center justify-between ${i < rows.length - 1 ? "mb-4" : "mb-0"}`}
          >
            <h2 className="font-outfit text-[12px] font-medium text-[#1F1750]">{r.label}</h2>
            <p
              className="w-[60%] break-all text-end font-outfit text-[14px] font-normal"
              style={{ color: "#7E7A95" }}
            >
              {r.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="#34369C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 8L16 12L10 16V8Z"
        stroke="#34369C"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="#34369C" strokeWidth="1.5" />
      <path fill="#34369C" d="M9 8h2v8H9V8zm4 0h2v8h-2V8z" />
    </svg>
  );
}

function MiniAudioPlayer({ src, scrubLabel }: { src: string; scrubLabel: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [playing]);

  return (
    <div className="mt-0 flex w-full max-w-4xl select-none items-center justify-between rounded-xl bg-[#d9d9d940] p-3">
      <button type="button" onClick={toggle} className="flex items-center justify-center rounded-full" aria-label={playing ? "Pause" : "Play"}>
        {playing ? <PauseGlyph /> : <PlayGlyph />}
      </button>
      <div className="relative mx-4 h-4 flex-1 cursor-pointer">
        <div className="absolute top-1/2 right-0 left-0 h-[2px] -translate-y-1/2 border-t border-dotted border-[#CFCFD1]" />
        <div
          className="absolute top-1/2 left-0 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-[#C2BCE4]"
          style={{ left: "0%" }}
        />
      </div>
      <div className="text-sm font-bold text-indigo-900">{scrubLabel}</div>
      <audio ref={audioRef} src={src} preload="none" onEnded={() => setPlaying(false)} />
    </div>
  );
}

function JourneyCallFeedback({
  dot,
  durationLabel,
  remarks,
  scrubLabel,
  audioSrc,
  compact,
}: {
  dot?: boolean;
  durationLabel: string;
  remarks: string;
  scrubLabel?: string;
  audioSrc?: string;
  compact?: boolean;
}) {
  const mb = compact ? "mb-3" : "mb-5";
  return (
    <div className={`relative pl-6 ${mb}`}>
      {dot ? (
        <div
          className="absolute top-0 left-0 z-10 h-[18px] w-[18px] -translate-x-px -translate-y-0.5 rounded-full"
          style={{ backgroundColor: "rgb(102, 85, 201)" }}
          aria-hidden
        />
      ) : null}
      <div className="rounded-[16px] bg-[#EFEFF1] p-4">
        <h2 className="mb-4 font-outfit text-[16px] font-semibold text-[#1F1750]">Call Feedback</h2>
        {audioSrc && scrubLabel ? <MiniAudioPlayer src={audioSrc} scrubLabel={scrubLabel} /> : null}
        <div className={`flex items-center justify-between ${audioSrc ? "mt-4" : "mt-0"}`}>
          <span className="font-outfit text-[12px] font-medium text-[#1F1750]">Call Duration</span>
          <span className="font-outfit text-[14px]" style={{ color: "#7E7A95" }}>
            {durationLabel}
          </span>
        </div>
        <h3 className="mt-4 font-outfit text-[12px] font-medium text-[#1F1750]">Remarks</h3>
        <p className="mt-1 break-all font-outfit text-[14px]" style={{ color: "#7E7A95" }}>
          {remarks}
        </p>
      </div>
    </div>
  );
}

function JourneyAiSummary({
  timeLabel,
  bullets,
  nextSteps,
  compact,
}: {
  timeLabel: string;
  bullets: string[];
  nextSteps: string;
  compact?: boolean;
}) {
  const mb = compact ? "mb-3" : "mb-5";
  return (
    <div className={`relative pl-6 ${mb}`}>
      <div className="rounded-[16px] p-[2px]" style={{ background: GRADIENT_BORDER }}>
        <div className="rounded-[16px] p-4" style={{ background: "rgb(239, 239, 241)" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-outfit text-[14px] font-medium" style={{ color: "rgb(31, 23, 80)" }}>
              Modify the AI-generated summary as needed
            </h2>
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold"
              style={{ backgroundColor: "rgb(52, 54, 156)", color: "rgb(245, 245, 245)" }}
            >
              <FaPen className="mr-2" size={18} />
              Edit
            </button>
          </div>
          <hr className="mt-3 mb-3 h-[1.5px] w-full border-0" style={{ background: "rgb(98, 92, 135)" }} />
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span
                className="ml-3 font-outfit text-[14px] font-medium"
                style={{
                  backgroundImage: AI_LABEL_GRADIENT,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                AI Generated
              </span>
              <span className="ml-3 font-outfit text-[18px] font-semibold text-[#1F1750]">Call Summary</span>
            </div>
            <span className="font-outfit text-[12px] font-medium" style={{ color: "rgb(126, 122, 149)" }}>
              {timeLabel}
            </span>
          </div>
          <ul className="ml-6 list-disc">
            {bullets.map((b, bi) => (
              <li key={bi} className="mt-2 break-all font-outfit text-[14px] text-[#1F1750]">
                {b}
              </li>
            ))}
            <li className="mt-2 break-all font-outfit text-[14px] font-normal text-[#1F1750]">
              <span className="font-medium" style={{ color: "rgb(52, 54, 156)" }}>
                Next Steps :{" "}
              </span>
              {nextSteps}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function JourneyComment({
  author,
  dateLabel,
  timeLabel,
  body,
  followupLabel,
  compact,
}: {
  author: string;
  dateLabel: string;
  timeLabel: string;
  body?: string;
  followupLabel?: string;
  compact?: boolean;
}) {
  const mb = compact ? "mb-3" : "mb-5";
  return (
    <div className={`relative pl-6 ${mb}`}>
      <div
        className="absolute top-0 left-0 z-10 h-[18px] w-[18px] -translate-x-px -translate-y-0.5 rounded-full"
        style={{ backgroundColor: "rgb(102, 85, 201)" }}
        aria-hidden
      />
      <div className="rounded-[16px] p-5" style={{ backgroundColor: "rgb(239, 239, 241)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/assets/images/userPlaceholder.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="ml-2 font-outfit text-[14px] font-medium text-[#1F1750]">{author}</span>
          </div>
          <div className="flex flex-col text-end">
            <span className="font-outfit text-[12px] font-light text-[#1F1750]">{dateLabel}</span>
            <span className="font-outfit text-[12px] font-light text-[#1F1750]">{timeLabel}</span>
          </div>
        </div>
        {body ? <p className="mt-6 break-all font-outfit text-[14px] text-[#1F1750]">{body}</p> : null}
        {followupLabel ? (
          <div className="mt-6 flex flex-col">
            <span className="font-outfit text-[14px] font-medium text-[#1F1750]">Followup Status</span>
            <span className="mt-1 font-outfit text-[12px] font-medium" style={{ color: "rgb(126, 122, 149)" }}>
              {followupLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function renderEvent(ev: JourneyEvent, compact?: boolean) {
  switch (ev.type) {
    case "note":
      return <JourneyNote text={ev.text} compact={compact} />;
    case "booking":
      return <JourneyBooking rows={ev.rows} compact={compact} />;
    case "callFeedback":
      return (
        <JourneyCallFeedback
          dot={ev.dot}
          durationLabel={ev.durationLabel}
          remarks={ev.remarks}
          scrubLabel={ev.scrubLabel}
          audioSrc={ev.audioSrc}
          compact={compact}
        />
      );
    case "aiSummary":
      return (
        <JourneyAiSummary timeLabel={ev.timeLabel} bullets={ev.bullets} nextSteps={ev.nextSteps} compact={compact} />
      );
    case "comment":
      return (
        <JourneyComment
          author={ev.author}
          dateLabel={ev.dateLabel}
          timeLabel={ev.timeLabel}
          body={ev.body}
          followupLabel={ev.followupLabel}
          compact={compact}
        />
      );
    default:
      return null;
  }
}

export type LeadJourneyPanelProps = {
  lead: LeadRow;
  /** Tighter vertical rhythm for embedded Activity hub. */
  variant?: "full" | "compact";
  showFilters?: boolean;
  collapsibleDates?: boolean;
  /** Optional scroll container (e.g. max height inside Activity). */
  scrollClassName?: string;
};

export function LeadJourneyPanel({
  lead,
  variant = "full",
  showFilters = true,
  collapsibleDates = true,
  scrollClassName,
}: LeadJourneyPanelProps) {
  const daysRaw = useMemo(() => getJourneyForLead(lead), [lead.id, lead.leadId]);
  const [filter, setFilter] = useState<JourneyCategory>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const daysFiltered = useMemo(() => filterJourneyDays(daysRaw, filter), [daysRaw, filter]);

  const firstDate = daysFiltered[0]?.dateLabel;
  useEffect(() => {
    if (!collapsibleDates) return;
    const fd = daysFiltered[0]?.dateLabel;
    setExpanded(fd ? { [fd]: true } : {});
  }, [collapsibleDates, lead.id, filter, daysFiltered]);

  const toggleDate = useCallback((label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const expandAll = useCallback(() => {
    const all: Record<string, boolean> = {};
    for (const d of daysFiltered) all[d.dateLabel] = true;
    setExpanded(all);
  }, [daysFiltered]);

  const collapseAll = useCallback(() => {
    const one: Record<string, boolean> = {};
    if (firstDate) one[firstDate] = true;
    setExpanded(one);
  }, [firstDate]);

  const compact = variant === "compact";
  const dateMb = compact ? "mb-2" : "mb-5";
  const dateText = compact ? "text-[14px]" : "text-[16px]";

  if (daysRaw.length === 0) {
    return (
      <div className="py-12 text-center font-outfit text-sm" style={{ color: "rgb(126, 122, 149)" }}>
        No journey events for this lead yet.
      </div>
    );
  }

  const inner = (
    <div className="relative">
      {showFilters ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {JOURNEY_FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setFilter(opt.id)}
                className="rounded-full px-3 py-1 font-outfit text-xs font-medium transition-colors"
                style={{
                  backgroundColor: active ? "rgb(52, 54, 156)" : "rgb(238, 239, 240)",
                  color: active ? "rgb(252, 253, 255)" : "rgb(31, 23, 80)",
                }}
              >
                {opt.label}
              </button>
            );
          })}
          {collapsibleDates ? (
            <span className="ml-auto hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={expandAll}
                className="font-outfit text-xs font-medium text-[#34369C] underline decoration-dotted"
              >
                Expand all dates
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="font-outfit text-xs font-medium text-[#7E7A95] underline decoration-dotted"
              >
                Collapse to latest
              </button>
            </span>
          ) : null}
        </div>
      ) : null}

      {daysFiltered.length === 0 ? (
        <div className="py-6 text-center font-outfit text-sm" style={{ color: "rgb(126, 122, 149)" }}>
          No events for this filter.
        </div>
      ) : null}

      {daysFiltered.map((day) => {
        const open = collapsibleDates ? (expanded[day.dateLabel] ?? false) : true;
        return (
          <div key={day.dateLabel} className="relative border-b border-[#ececf0] last:border-b-0">
            {collapsibleDates ? (
              <button
                type="button"
                onClick={() => toggleDate(day.dateLabel)}
                className={`${dateMb} ml-[25px] flex w-[calc(100%-25px)] max-w-2xl items-center gap-2 rounded-lg px-3 py-1.5 text-left font-outfit font-medium text-[#1F1750] transition-opacity hover:opacity-90`}
                style={{ backgroundColor: "#7679FF4D" }}
              >
                <span className={dateText}>{day.dateLabel}</span>
                <span className="ml-auto shrink-0 text-[#34369C]" aria-hidden>
                  {open ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
                </span>
              </button>
            ) : (
              <div
                className={`${dateMb} ml-[25px] w-fit rounded-lg px-3 py-1 font-outfit ${dateText} font-medium text-[#1F1750]`}
                style={{ backgroundColor: "#7679FF4D" }}
              >
                {day.dateLabel}
              </div>
            )}
            {open ? (
              <div>
                {day.events.map((ev, i) => (
                  <div key={`${day.dateLabel}-${i}`}>{renderEvent(ev, compact)}</div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );

  if (scrollClassName) {
    return <div className={scrollClassName}>{inner}</div>;
  }
  return inner;
}
