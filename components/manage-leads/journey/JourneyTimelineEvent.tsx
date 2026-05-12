"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { JourneyEvent } from "@/lib/lead-journey-types";
import { formatJourneyFieldUpdateSentence } from "@/lib/lead-journey-utils";
import { FaPen } from "react-icons/fa";

export type JourneyRenderOptions = {
  /** Drop left rail padding (nested under Zoho timeline). */
  flushLeft?: boolean;
  /** Remove bottom margin (stacked under a summary row). */
  flushBottom?: boolean;
  /** When set, `structured` events with `rows` render only the detail grid (headline already in Zoho row). */
  structuredRowsOnly?: boolean;
  /** When set, `fieldUpdate` renders only `blueprintRows` as a form grid (summary already in Zoho row). */
  blueprintFormOnly?: boolean;
};

function railMb(compact: boolean | undefined, flushBottom?: boolean) {
  if (flushBottom) return "mb-0";
  return compact ? "mb-3" : "mb-5";
}

function JourneyNote({
  text,
  compact,
  flushLeft,
  flushBottom,
}: {
  text: string;
  compact?: boolean;
  flushLeft?: boolean;
  flushBottom?: boolean;
}) {
  const pl = flushLeft ? "pl-0" : "pl-6";
  const mb = railMb(compact, flushBottom);
  return (
    <div className={`relative ${pl} ${mb}`}>
      <div className={`flex w-full ${flushLeft ? "justify-start" : "items-center justify-center"}`}>
        <div
          className={`rounded-[100px] px-4 py-1.5 text-center font-outfit text-[12px] font-medium leading-snug ${compact ? "max-w-full" : flushLeft ? "max-w-full text-left" : "max-w-[min(100%,520px)] w-full"}`}
          style={{ backgroundColor: "#EEEFF0", color: "#7E7A95" }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

const GRADIENT_BORDER =
  "linear-gradient(90deg, rgb(10, 216, 234), rgb(98, 48, 201), rgb(230, 128, 178))";
const AI_LABEL_GRADIENT =
  "linear-gradient(90deg, rgb(14, 184, 249), rgb(95, 52, 254), rgb(165, 70, 217), rgb(232, 128, 172))";

function JourneyBooking({
  rows,
  compact,
  flushLeft,
  flushBottom,
}: {
  rows: { label: string; value: string }[];
  compact?: boolean;
  flushLeft?: boolean;
  flushBottom?: boolean;
}) {
  const pl = flushLeft ? "pl-0" : "pl-6";
  const mb = railMb(compact, flushBottom);
  return (
    <div className={`relative ${pl} ${mb}`}>
      <div className={`rounded-2xl ${compact ? "p-3" : "p-4"}`} style={{ backgroundColor: "#EFEFF1" }}>
        <dl className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-3 gap-y-2">
          {rows.map((r) => (
            <div key={r.label} className="contents">
              <dt className="font-outfit text-[12px] font-medium text-[#1F1750]">{r.label}</dt>
              <dd className="break-all text-end font-outfit text-[13px] font-normal" style={{ color: "#7E7A95" }}>
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function PlayGlyph() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
      void el
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  }, [playing]);

  return (
    <div className="mt-2 flex w-full max-w-4xl select-none items-center justify-between rounded-xl bg-[#d9d9d940] px-2.5 py-2">
      <button
        type="button"
        onClick={toggle}
        className="flex shrink-0 items-center justify-center rounded-full"
        aria-label={playing ? "Pause recording" : "Play recording"}
      >
        {playing ? <PauseGlyph /> : <PlayGlyph />}
      </button>
      <div className="relative mx-3 h-4 min-w-0 flex-1 cursor-default">
        <div className="absolute top-1/2 right-0 left-0 h-[2px] -translate-y-1/2 border-t border-dotted border-[#CFCFD1]" />
        <div
          className="absolute top-1/2 left-0 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C2BCE4]"
          style={{ left: "0%" }}
          aria-hidden
        />
      </div>
      <div className="shrink-0 text-sm font-bold text-indigo-900">{scrubLabel}</div>
      <audio ref={audioRef} src={src} preload="none" onEnded={() => setPlaying(false)} />
    </div>
  );
}

function MetaRow({ label, value, compact }: { label: string; value: string; compact?: boolean }) {
  const vClass = compact ? "text-[12px]" : "text-[13px]";
  return (
    <div className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-baseline gap-x-3 gap-y-0.5">
      <span className="font-outfit text-[12px] font-medium text-[#1F1750]">{label}</span>
      <span className={`break-words text-end font-outfit font-normal ${vClass}`} style={{ color: "#7E7A95" }}>
        {value}
      </span>
    </div>
  );
}

function JourneyCallFeedback({
  dot,
  durationLabel,
  remarks,
  status,
  subStatus,
  showUpdate,
  scrubLabel,
  audioSrc,
  compact,
  flushLeft,
  flushBottom,
}: {
  dot?: boolean;
  durationLabel: string;
  remarks: string;
  status?: string;
  subStatus?: string;
  showUpdate?: boolean;
  scrubLabel?: string;
  audioSrc?: string;
  compact?: boolean;
  flushLeft?: boolean;
  flushBottom?: boolean;
}) {
  const pl = flushLeft ? "pl-0" : "pl-6";
  const mb = railMb(compact, flushBottom);
  const pad = compact ? "p-3" : "p-4";
  const statusText = (status ?? "").trim() || "Not Added";
  const subText = (subStatus ?? "").trim() || "Not Added";
  const remarksText = (remarks ?? "").trim() || "Not Added";
  const showDot = !!dot && !flushLeft;

  return (
    <div className={`relative ${pl} ${mb}`}>
      {showDot ? (
        <div
          className="absolute top-0 left-0 z-10 h-[18px] w-[18px] -translate-x-px -translate-y-0.5 rounded-full"
          style={{ backgroundColor: "rgb(102, 85, 201)" }}
          aria-hidden
        />
      ) : null}
      <div className={`rounded-2xl bg-[#EFEFF1] ${pad}`}>
        <div className="flex items-start justify-between gap-2">
          <h2 className={`font-outfit font-semibold text-[#1F1750] ${compact ? "text-[14px]" : "text-[15px]"}`}>
            Call Feedback
          </h2>
          {showUpdate ? (
            <button
              type="button"
              className="shrink-0 rounded-full bg-[#34369C] px-3 py-1.5 font-outfit text-[11px] font-semibold text-white hover:opacity-95"
            >
              Update
            </button>
          ) : null}
        </div>

        {audioSrc && scrubLabel ? <MiniAudioPlayer src={audioSrc} scrubLabel={scrubLabel} /> : null}

        <div className={`space-y-2 ${audioSrc ? "mt-3" : "mt-2"}`}>
          <MetaRow label="Call Duration" value={durationLabel} compact={compact} />
          <MetaRow label="Status" value={statusText} compact={compact} />
          <MetaRow label="Sub Status" value={subText} compact={compact} />
        </div>

        <div className="mt-3 border-t border-[#e4e4e8]/80 pt-2">
          <h3 className="font-outfit text-[12px] font-medium text-[#1F1750]">Remarks</h3>
          <p className="mt-1 break-words font-outfit text-[12px] leading-snug sm:text-[13px]" style={{ color: "#7E7A95" }}>
            {remarksText}
          </p>
        </div>
      </div>
    </div>
  );
}

function JourneyAiSummary({
  timeLabel,
  bullets,
  nextSteps,
  compact,
  flushLeft,
  flushBottom,
}: {
  timeLabel: string;
  bullets: string[];
  nextSteps: string;
  compact?: boolean;
  flushLeft?: boolean;
  flushBottom?: boolean;
}) {
  const pl = flushLeft ? "pl-0" : "pl-6";
  const mb = railMb(compact, flushBottom);
  const innerPad = compact ? "p-3" : "p-4";
  const titleRow = compact ? "text-[11px]" : "text-[13px]";
  const editPad = compact ? "px-3 py-2 text-xs" : "px-5 py-3 text-sm";

  return (
    <div className={`relative ${pl} ${mb}`}>
      <div className="rounded-2xl p-[2px]" style={{ background: GRADIENT_BORDER }}>
        <div className={`rounded-2xl ${innerPad}`} style={{ background: "rgb(239, 239, 241)" }}>
          <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${compact ? "" : ""}`}>
            <h2 className={`font-outfit font-medium leading-snug sm:max-w-[60%] ${titleRow}`} style={{ color: "rgb(31, 23, 80)" }}>
              Modify the AI-generated summary as needed
            </h2>
            <button
              type="button"
              className={`flex shrink-0 cursor-pointer items-center justify-center rounded-3xl font-semibold ${editPad}`}
              style={{ backgroundColor: "rgb(52, 54, 156)", color: "rgb(245, 245, 245)" }}
            >
              <FaPen className="mr-2" size={compact ? 14 : 18} />
              Edit
            </button>
          </div>
          <hr className="my-2 h-[1.5px] w-full border-0 sm:my-3" style={{ background: "rgb(98, 92, 135)" }} />
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col">
              <span
                className="ml-0 font-outfit text-[12px] font-medium sm:ml-1 sm:text-[14px]"
                style={{
                  backgroundImage: AI_LABEL_GRADIENT,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                AI Generated
              </span>
              <span className="ml-0 font-outfit text-[16px] font-semibold text-[#1F1750] sm:ml-1 sm:text-[18px]">
                Call Summary
              </span>
            </div>
            <span className="font-outfit text-[11px] font-medium sm:text-[12px]" style={{ color: "rgb(126, 122, 149)" }}>
              {timeLabel}
            </span>
          </div>
          <ul className="ml-4 list-disc sm:ml-5">
            {bullets.map((b, bi) => (
              <li key={bi} className="mt-1.5 break-words font-outfit text-[12px] leading-snug text-[#1F1750] sm:mt-2 sm:text-[14px]">
                {b}
              </li>
            ))}
            <li className="mt-1.5 break-words font-outfit text-[12px] font-normal leading-snug text-[#1F1750] sm:mt-2 sm:text-[14px]">
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
  flushLeft,
  flushBottom,
}: {
  author: string;
  dateLabel: string;
  timeLabel: string;
  body?: string;
  followupLabel?: string;
  compact?: boolean;
  flushLeft?: boolean;
  flushBottom?: boolean;
}) {
  const pl = flushLeft ? "pl-0" : "pl-6";
  const mb = railMb(compact, flushBottom);
  const pad = compact ? "p-4" : "p-5";
  return (
    <div className={`relative ${pl} ${mb}`}>
      {!flushLeft ? (
        <div
          className="absolute top-0 left-0 z-10 h-[18px] w-[18px] -translate-x-px -translate-y-0.5 rounded-full"
          style={{ backgroundColor: "rgb(102, 85, 201)" }}
          aria-hidden
        />
      ) : null}
      <div className={`rounded-2xl ${pad}`} style={{ backgroundColor: "rgb(239, 239, 241)" }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center">
            <Image
              src="/assets/images/userPlaceholder.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <span className="ml-2 truncate font-outfit text-[14px] font-medium text-[#1F1750]">{author}</span>
          </div>
          <div className="shrink-0 text-end">
            <span className="block font-outfit text-[12px] font-light text-[#1F1750]">{dateLabel}</span>
            <span className="block font-outfit text-[12px] font-light text-[#1F1750]">{timeLabel}</span>
          </div>
        </div>
        {body ? <p className="mt-4 break-words font-outfit text-[14px] text-[#1F1750] sm:mt-6">{body}</p> : null}
        {followupLabel ? (
          <div className="mt-4 sm:mt-6">
            <span className="font-outfit text-[14px] font-medium text-[#1F1750]">Followup Status</span>
            <span className="mt-1 block font-outfit text-[12px] font-medium" style={{ color: "rgb(126, 122, 149)" }}>
              {followupLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function JourneyStructured({
  headline,
  rows,
  compact,
  flushLeft,
  flushBottom,
}: {
  headline: string;
  rows?: { label: string; value: string }[];
  compact?: boolean;
  flushLeft?: boolean;
  flushBottom?: boolean;
}) {
  const pl = flushLeft ? "pl-0" : "pl-6";
  const mb = railMb(compact, flushBottom);
  const hasRows = !!rows?.length;
  const showHeadline = headline.trim().length > 0;
  return (
    <div className={`relative ${pl} ${mb}`}>
      {showHeadline ? (
        <div className={`flex w-full ${flushLeft ? "justify-start" : "items-center justify-center"}`}>
          <div
            className={`max-w-full rounded-[100px] px-4 py-1.5 text-center font-outfit text-[12px] font-medium leading-snug ${compact ? "" : flushLeft ? "w-full text-left" : "sm:max-w-[min(100%,420px)]"}`}
            style={{ backgroundColor: "#EFEFF0", color: "#7E7A95" }}
          >
            {headline}
          </div>
        </div>
      ) : null}
      {hasRows ? (
        <div className={`rounded-2xl ${compact ? "p-3" : "p-3.5"} ${showHeadline ? "mt-2" : ""}`} style={{ backgroundColor: "#EFEFF1" }}>
          <dl className="grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-3 gap-y-1.5">
            {rows!.map((r) => (
              <div key={r.label} className="contents">
                <dt className="font-outfit text-[12px] font-medium text-[#1F1750]">{r.label}</dt>
                <dd className="break-words text-end font-outfit text-[12px] sm:text-[13px]" style={{ color: "#7E7A95" }}>
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}

export function renderJourneyEvent(ev: JourneyEvent, compact?: boolean, options?: JourneyRenderOptions) {
  const f = options?.flushLeft;
  const b = options?.flushBottom;
  switch (ev.type) {
    case "note":
      return <JourneyNote text={ev.text} compact={compact} flushLeft={f} flushBottom={b} />;
    case "fieldUpdate":
      if (options?.blueprintFormOnly && ev.blueprintRows?.length) {
        return <JourneyBooking rows={ev.blueprintRows} compact={compact} flushLeft={f} flushBottom={b} />;
      }
      return (
        <JourneyNote
          text={formatJourneyFieldUpdateSentence(ev.field, ev.oldValue, ev.newValue)}
          compact={compact}
          flushLeft={f}
          flushBottom={b}
        />
      );
    case "booking":
      return <JourneyBooking rows={ev.rows} compact={compact} flushLeft={f} flushBottom={b} />;
    case "callFeedback":
      return (
        <JourneyCallFeedback
          dot={ev.dot}
          durationLabel={ev.durationLabel}
          remarks={ev.remarks}
          status={ev.status}
          subStatus={ev.subStatus}
          showUpdate={ev.showUpdate}
          scrubLabel={ev.scrubLabel}
          audioSrc={ev.audioSrc}
          compact={compact}
          flushLeft={f}
          flushBottom={b}
        />
      );
    case "aiSummary":
      return (
        <JourneyAiSummary
          timeLabel={ev.timeLabel}
          bullets={ev.bullets}
          nextSteps={ev.nextSteps}
          compact={compact}
          flushLeft={f}
          flushBottom={b}
        />
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
          flushLeft={f}
          flushBottom={b}
        />
      );
    case "structured":
      return (
        <JourneyStructured
          headline={options?.structuredRowsOnly && ev.rows?.length ? "" : ev.headline}
          rows={ev.rows}
          compact={compact}
          flushLeft={f}
          flushBottom={b}
        />
      );
    default:
      return null;
  }
}
