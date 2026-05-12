"use client";

import type { ReactNode } from "react";
import type { JourneyEvent } from "@/lib/lead-journey-types";
import { fieldValueForZohoDisplay, journeyEventPreview } from "@/lib/lead-journey-utils";
import { renderJourneyEvent } from "@/components/manage-leads/journey/JourneyTimelineEvent";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineClipboardDocumentList,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlinePhone,
  HiOutlinePencilSquare,
  HiOutlineSparkles,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

function zohoTime(ev: JourneyEvent): string | undefined {
  switch (ev.type) {
    case "note":
    case "fieldUpdate":
    case "booking":
    case "callFeedback":
    case "structured":
      return ev.timeLabel?.trim() || undefined;
    case "aiSummary":
      return ev.timeLabel?.trim() || undefined;
    case "comment":
      return ev.timeLabel?.trim() || undefined;
    default:
      return undefined;
  }
}

function zohoActor(ev: JourneyEvent): string | undefined {
  switch (ev.type) {
    case "note":
    case "fieldUpdate":
    case "booking":
    case "callFeedback":
    case "structured":
      return ev.actorName?.trim() || undefined;
    case "aiSummary":
      return ev.actorName?.trim() || undefined;
    case "comment":
      return ev.author?.trim() || undefined;
    default:
      return undefined;
  }
}

function zohoIcon(ev: JourneyEvent): ReactNode {
  const cls = "h-3.5 w-3.5 text-slate-600";
  switch (ev.type) {
    case "fieldUpdate":
      return <HiOutlinePencilSquare className={cls} aria-hidden />;
    case "note":
      return <HiOutlineDocumentText className={cls} aria-hidden />;
    case "booking":
      return <HiOutlineClipboardDocumentList className={cls} aria-hidden />;
    case "callFeedback":
      return <HiOutlinePhone className={cls} aria-hidden />;
    case "aiSummary":
      return <HiOutlineSparkles className={cls} aria-hidden />;
    case "comment":
      return <HiOutlineChatBubbleLeftRight className={cls} aria-hidden />;
    case "structured": {
      const k = ev.kind.toLowerCase();
      if (k.startsWith("sv.")) return <HiOutlineClipboardDocumentList className={cls} aria-hidden />;
      if (k.startsWith("call.") || k.includes("call")) return <HiOutlinePhone className={cls} aria-hidden />;
      if (k.startsWith("view.masked") || k.startsWith("view."))
        return <HiOutlineEye className={cls} aria-hidden />;
      if (k.startsWith("lead.assign") || k.startsWith("lead.reassign"))
        return <HiOutlineUserGroup className={cls} aria-hidden />;
      return <HiOutlineDocumentText className={cls} aria-hidden />;
    }
    default:
      return <HiOutlineDocumentText className={cls} aria-hidden />;
  }
}

function zohoPrimaryLine(ev: JourneyEvent): ReactNode {
  switch (ev.type) {
    case "fieldUpdate": {
      const f = ev.field.trim() || "Field";
      const o = fieldValueForZohoDisplay(ev.oldValue);
      const n = fieldValueForZohoDisplay(ev.newValue);
      return (
        <p className="font-outfit text-[13px] leading-snug text-slate-800">
          <span className="text-slate-900">{f}</span> was updated from{" "}
          <strong className="font-semibold text-slate-900">{o}</strong> to{" "}
          <strong className="font-semibold text-slate-900">{n}</strong>
        </p>
      );
    }
    case "note":
      return (
        <p className="font-outfit text-[13px] leading-snug text-slate-800">
          <span className="text-slate-600">Note — </span>
          {ev.text}
        </p>
      );
    case "comment":
      return (
        <p className="font-outfit text-[13px] leading-snug text-slate-800">
          <span className="text-slate-600">Comment — </span>
          {ev.body ? (
            ev.body
          ) : (
            <span className="text-slate-500">Expand for thread</span>
          )}
        </p>
      );
    case "booking":
      return (
        <p className="font-outfit text-[13px] leading-snug text-slate-800">
          <span className="text-slate-600">Stage capture — </span>
          {ev.summaryLine?.trim() ||
            (ev.rows[0] ? `${ev.rows[0].label}: ${ev.rows[0].value}` : "Booking form")}
        </p>
      );
    case "callFeedback":
      return (
        <p className="font-outfit text-[13px] leading-snug text-slate-800">
          <span className="text-slate-600">Call — </span>
          {journeyEventPreview(ev)}
        </p>
      );
    case "structured": {
      const k = ev.kind.toLowerCase();
      const prefix = k.startsWith("sv.") ? "Site visit — " : "";
      return (
        <p className="font-outfit text-[13px] leading-snug text-slate-800">
          {prefix ? <span className="text-slate-600">{prefix}</span> : null}
          {ev.headline}
        </p>
      );
    }
    case "aiSummary":
      return (
        <p className="font-outfit text-[13px] leading-snug text-slate-800">
          <span className="text-slate-600">AI summary — </span>
          {ev.bullets[0]?.trim() ?? ev.timeLabel}
        </p>
      );
    default:
      return (
        <p className="font-outfit text-[13px] leading-snug text-slate-800">
          {journeyEventPreview(ev)}
        </p>
      );
  }
}

function hasExpandableWidget(ev: JourneyEvent): boolean {
  return (
    ev.type === "callFeedback" ||
    ev.type === "aiSummary" ||
    ev.type === "booking" ||
    ev.type === "comment" ||
    (ev.type === "structured" && !!ev.rows?.length) ||
    (ev.type === "fieldUpdate" && !!ev.blueprintRows?.length)
  );
}

function detailRenderOptions(ev: JourneyEvent) {
  const base = { flushLeft: true as const, flushBottom: true as const };
  if (ev.type === "structured" && ev.rows?.length) {
    return { ...base, structuredRowsOnly: true as const };
  }
  if (ev.type === "fieldUpdate" && ev.blueprintRows?.length) {
    return { ...base, blueprintFormOnly: true as const };
  }
  return base;
}

function ZohoMeta({ actor, dateLabel }: { actor?: string; dateLabel: string }) {
  if (!actor) return null;
  return (
    <p className="mt-0.5 font-outfit text-[11px] leading-snug text-slate-500">
      by {actor} {dateLabel}
    </p>
  );
}

export type JourneyZohoTimelineDayProps = {
  dateLabel: string;
  events: JourneyEvent[];
  compact?: boolean;
  expandedRows: Record<string, boolean>;
  onToggleRow: (rowKey: string) => void;
};

/**
 * Zoho-inspired rows: spine, time, icon, summary; expandable block for widgets / stage forms.
 */
export function JourneyZohoTimelineDay({ dateLabel, events, compact, expandedRows, onToggleRow }: JourneyZohoTimelineDayProps) {
  const spineLeft = "calc(4.5rem + 1rem - 0.5px)";

  return (
    <div className="relative ml-0.5 sm:ml-1">
      <div
        className="pointer-events-none absolute z-0 w-px bg-slate-200"
        style={{ left: spineLeft, top: "0.5rem", bottom: "0.5rem" }}
        aria-hidden
      />

      <ul className="relative z-[1] m-0 list-none p-0">
        {events.map((ev, i) => {
          const time = zohoTime(ev);
          const actor = zohoActor(ev);
          const expandable = hasExpandableWidget(ev);
          const rowKey = `${dateLabel}::${i}`;
          const open = !!expandedRows[rowKey];

          return (
            <li key={rowKey} className="border-b border-slate-100 py-3 last:border-b-0">
              <div className="grid grid-cols-[4.5rem_2rem_minmax(0,1fr)] items-start gap-x-2 gap-y-1">
                <div className="pt-1 text-right font-outfit text-[11px] tabular-nums text-slate-500">
                  {time ?? ""}
                </div>
                <div className="flex justify-center pt-0.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm ring-4 ring-white">
                    {zohoIcon(ev)}
                  </span>
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="flex items-start gap-1.5">
                    <div className="min-w-0 shrink">
                      {zohoPrimaryLine(ev)}
                      <ZohoMeta actor={actor} dateLabel={dateLabel} />
                    </div>
                    {expandable ? (
                      <button
                        type="button"
                        onClick={() => onToggleRow(rowKey)}
                        className="mt-0.5 shrink-0 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        aria-expanded={open}
                        aria-label={open ? "Hide details" : "Show details"}
                      >
                        {open ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
                      </button>
                    ) : null}
                  </div>
                  {expandable && open ? (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                      {renderJourneyEvent(ev, !!compact, detailRenderOptions(ev))}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
