"use client";

import { DetailsCanvasNodeView } from "@/components/developer/DetailsCanvasNodeView";
import { canvasNodeChromeTitle } from "@/lib/canvas-node-chrome";
import { canvasNodeIsCompactLayout, canvasNodeOmitsChromeHeader } from "@/lib/canvas-node-layout";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import type { PlacedCanvasNode } from "@/lib/widget-canvas-v2-types";

/** Read-only V2 canvas snapshot for lead detail (matches configurator layout per tab). */
export function LeadDetailV2TabCanvas({
  nodes,
  lead,
  leftRailFieldIds,
  onLeadStageChange,
  className = "",
}: {
  nodes: PlacedCanvasNode[];
  lead: LeadRow;
  leftRailFieldIds: LeftRailFieldId[];
  /** When set, Change Stage widget updates the preview lead. */
  onLeadStageChange?: (stage: string) => void;
  className?: string;
}) {
  const ordered = [...nodes].sort((a, b) => a.z - b.z);
  return (
    <div
      className={`relative min-h-[12rem] flex-1 overflow-hidden rounded-xl border border-slate-200/80 bg-[#e2e6ef] shadow-[inset_0_2px_10px_rgba(255,255,255,0.35)] ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {ordered.map((n) => {
        const compact = canvasNodeIsCompactLayout(n);
        const omitHeader = canvasNodeOmitsChromeHeader(n);
        const headerStyle =
          n.type === "widget"
            ? {
                background: n.headerStyle?.backgroundColor ?? "linear-gradient(to right, #f4f5ff, white)",
                color: n.headerStyle?.color,
              }
            : compact
              ? undefined
              : { background: "linear-gradient(to right, #f4f5ff, white)" };
        const headerMuted = n.type === "widget" && n.headerStyle?.color;

        if (omitHeader) {
          return (
            <div
              key={n.id}
              className="absolute flex flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white/95 shadow-sm"
              style={{
                left: `${n.x * 100}%`,
                top: `${n.y * 100}%`,
                width: `${n.w * 100}%`,
                height: `${n.h * 100}%`,
                zIndex: n.z,
              }}
            >
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg">
                <DetailsCanvasNodeView
                  node={n}
                  lead={lead}
                  leftRailFieldIds={leftRailFieldIds}
                  onStagePreview={onLeadStageChange}
                />
              </div>
            </div>
          );
        }

        const title = canvasNodeChromeTitle(n);
        return (
          <div
            key={n.id}
            className={`absolute flex flex-col bg-white/95 ${
              compact
                ? "rounded-lg border border-slate-200/90 shadow-sm"
                : "rounded-xl border-2 border-slate-300/80 shadow-[0_8px_28px_-10px_rgba(31,23,80,0.2)]"
            }`}
            style={{
              left: `${n.x * 100}%`,
              top: `${n.y * 100}%`,
              width: `${n.w * 100}%`,
              height: `${n.h * 100}%`,
              zIndex: n.z,
            }}
          >
            <div
              className={`flex shrink-0 items-center border-b border-slate-200/80 font-outfit font-semibold ${
                compact
                  ? "h-6 min-h-[1.5rem] rounded-t-md bg-slate-50/95 px-1 py-0 text-[9px]"
                  : `rounded-t-[10px] px-1.5 py-0.5 text-[10px] ${headerMuted ? "" : "text-[#1F1750]"}`
              }`}
              style={headerStyle}
            >
              <span className={`min-w-0 truncate ${compact && !headerMuted ? "text-[#334155]" : ""}`}>{title}</span>
            </div>
            <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${compact ? "rounded-b-md" : "rounded-b-[10px]"}`}>
              <DetailsCanvasNodeView
                node={n}
                lead={lead}
                leftRailFieldIds={leftRailFieldIds}
                onStagePreview={onLeadStageChange}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
