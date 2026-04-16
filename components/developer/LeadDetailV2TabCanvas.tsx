"use client";

import { WidgetV2CanvasBlockBody } from "@/components/developer/WidgetV2CanvasBlockBody";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import type { PlacedCanvasWidget } from "@/lib/widget-canvas-v2-types";

/** Read-only V2 canvas snapshot for lead detail (matches configurator layout per tab). */
export function LeadDetailV2TabCanvas({
  widgets,
  lead,
  leftRailFieldIds,
  className = "",
}: {
  widgets: PlacedCanvasWidget[];
  lead: LeadRow;
  leftRailFieldIds: LeftRailFieldId[];
  className?: string;
}) {
  const ordered = [...widgets].sort((a, b) => a.z - b.z);
  return (
    <div
      className={`relative min-h-[12rem] flex-1 overflow-hidden rounded-xl border border-slate-200/80 bg-[#e2e6ef] shadow-[inset_0_2px_10px_rgba(255,255,255,0.35)] ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {ordered.map((w) => (
        <div
          key={w.id}
          className="absolute flex flex-col rounded-xl border-2 border-slate-300/80 bg-white/95 shadow-[0_8px_28px_-10px_rgba(31,23,80,0.2)]"
          style={{
            left: `${w.x * 100}%`,
            top: `${w.y * 100}%`,
            width: `${w.w * 100}%`,
            height: `${w.h * 100}%`,
            zIndex: w.z,
          }}
        >
          <div className="flex shrink-0 items-center rounded-t-[10px] border-b border-slate-200/80 bg-gradient-to-r from-[#f4f5ff] to-white px-1.5 py-0.5">
            <span className="min-w-0 truncate font-outfit text-[10px] font-semibold text-[#1F1750]">{w.title}</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <WidgetV2CanvasBlockBody kind={w.kind} lead={lead} leftRailFieldIds={leftRailFieldIds} />
          </div>
        </div>
      ))}
    </div>
  );
}
