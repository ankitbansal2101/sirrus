"use client";

import { FiCalendar, FiPhone, FiStar, FiUser } from "react-icons/fi";
import { WidgetV2CanvasBlockBody } from "@/components/developer/WidgetV2CanvasBlockBody";
import { getCanvasFieldRow } from "@/lib/canvas-field-display";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import type { PlacedCanvasNode } from "@/lib/widget-canvas-v2-types";

function textTransformClass(t?: string) {
  if (t === "uppercase") return "uppercase";
  if (t === "lowercase") return "lowercase";
  return "normal-case";
}

function alignClass(a?: string) {
  if (a === "end") return "text-end";
  if (a === "center") return "text-center";
  return "text-start";
}

function IconGlyph({ glyph }: { glyph?: string }) {
  const g = glyph ?? "star";
  const cls = "h-4 w-4";
  if (g === "phone") return <FiPhone className={cls} aria-hidden />;
  if (g === "calendar") return <FiCalendar className={cls} aria-hidden />;
  if (g === "user") return <FiUser className={cls} aria-hidden />;
  return <FiStar className={cls} aria-hidden />;
}

/** Read-only canvas block body (widgets, fields, layout primitives). */
export function DetailsCanvasNodeView({
  node,
  lead,
  leftRailFieldIds,
  onStagePreview,
}: {
  node: PlacedCanvasNode;
  lead: LeadRow;
  leftRailFieldIds: LeftRailFieldId[];
  onStagePreview?: (stage: string) => void;
}) {
  switch (node.type) {
    case "widget": {
      return (
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-b-[10px]"
          style={{
            backgroundColor: node.bodyBackgroundColor,
            gap: node.rowGapPx != null ? `${node.rowGapPx}px` : undefined,
          }}
        >
          <WidgetV2CanvasBlockBody
            kind={node.kind}
            lead={lead}
            leftRailFieldIds={leftRailFieldIds}
            options={{
              taskColumns: node.columns?.taskColumns,
              onStagePreview: node.kind === "change-stage" ? onStagePreview : undefined,
            }}
          />
        </div>
      );
    }
    case "field": {
      const { label, value } = getCanvasFieldRow(lead, node.fieldId);
      const ls = node.labelStyle;
      const vs = node.valueStyle;
      const labelSize = ls?.fontSizePx ?? 11;
      const valueSize = vs?.fontSizePx ?? 13;
      return (
        <div className="flex min-h-0 flex-1 flex-col justify-start gap-1 overflow-hidden px-2 py-1">
          <div
            className={`shrink-0 font-outfit font-medium leading-none ${textTransformClass(ls?.textTransform)}`}
            style={{
              fontSize: `${labelSize}px`,
              fontFamily: ls?.fontFamily,
              color: ls?.color ?? "#64748b",
              backgroundColor: ls?.backgroundColor ?? "transparent",
            }}
          >
            {label}
          </div>
          <div
            className={`min-h-0 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(15,23,42,0.03)] ${textTransformClass(vs?.textTransform)} ${alignClass(vs?.align)}`}
            style={{
              fontSize: `${valueSize}px`,
              fontFamily: vs?.fontFamily,
              color: vs?.color ?? "#0f172a",
              backgroundColor: vs?.backgroundColor ?? "#ffffff",
            }}
          >
            <span className="line-clamp-3 break-words font-outfit font-normal leading-snug">{value}</span>
          </div>
        </div>
      );
    }
    case "section": {
      const s = node.style;
      return (
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md px-2 py-1.5"
          style={{
            backgroundColor: s?.backgroundColor ?? "#f8fafc",
            borderWidth: s?.borderWidthPx != null ? s.borderWidthPx : 1,
            borderStyle: "solid",
            borderColor: s?.borderColor ?? "#e2e8f0",
            borderRadius: s?.borderRadiusPx != null ? s.borderRadiusPx : 6,
            padding: s?.paddingPx != null ? s.paddingPx : 6,
          }}
        >
          {node.label ? (
            <span className="mb-0.5 shrink-0 font-outfit text-[11px] font-medium text-[#64748b]">{node.label}</span>
          ) : null}
          <span className="font-outfit text-[10px] leading-snug text-[#94a3b8]">
            Group — stack compact fields or widgets in z-order.
          </span>
        </div>
      );
    }
    case "text": {
      const ts = node.textStyle;
      const content = ts?.content ?? "Text";
      return (
        <div className="flex min-h-0 flex-1 flex-col justify-start overflow-hidden px-2 py-1">
          <div
            className="min-h-0 w-full flex-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 font-outfit leading-snug shadow-[inset_0_1px_0_rgba(15,23,42,0.03)]"
            style={{
              fontSize: ts?.fontSizePx ? `${ts.fontSizePx}px` : 13,
              color: ts?.color ?? "#334155",
              backgroundColor: ts?.backgroundColor ?? "#ffffff",
              fontFamily: ts?.fontFamily,
            }}
          >
            {content}
          </div>
        </div>
      );
    }
    case "line": {
      const ls = node.lineStyle;
      const horiz = (ls?.orientation ?? "horizontal") === "horizontal";
      const thick = ls?.thicknessPx ?? 2;
      const color = ls?.color ?? "rgba(100,116,139,0.5)";
      if (horiz) {
        return (
          <div className="flex min-h-0 flex-1 items-center justify-center px-2">
            <div className="h-full w-full max-h-[2px] min-h-[2px] self-center rounded-full" style={{ height: thick, backgroundColor: color }} />
          </div>
        );
      }
      return (
        <div className="flex min-h-0 flex-1 items-stretch justify-center py-2">
          <div className="h-full min-w-[2px] rounded-full" style={{ width: thick, backgroundColor: color }} />
        </div>
      );
    }
    case "icon": {
      const ic = node.iconStyle;
      return (
        <div
          className="flex min-h-0 flex-1 items-center justify-center rounded-md border border-slate-200/90 bg-white p-0.5"
          style={{ backgroundColor: ic?.backgroundColor ?? "#ffffff" }}
        >
          <span className="flex h-7 w-7 items-center justify-center" style={{ color: ic?.iconColor ?? "#475569" }}>
            <IconGlyph glyph={ic?.glyph} />
          </span>
        </div>
      );
    }
    default:
      return null;
  }
}
