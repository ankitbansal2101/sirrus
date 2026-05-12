"use client";

import { useCallback, useRef } from "react";
import { MdDeleteOutline } from "react-icons/md";
import { DetailsCanvasNodeView } from "@/components/developer/DetailsCanvasNodeView";
import { canvasNodeChromeTitle } from "@/lib/canvas-node-chrome";
import {
  canvasNodeIsCompactLayout,
  canvasNodeMinBounds,
  canvasNodeOmitsChromeHeader,
} from "@/lib/canvas-node-layout";
import type { LeftRailFieldId } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import type { PlacedCanvasNode } from "@/lib/widget-canvas-v2-types";

type ResizeEdgeKind = "se" | "e" | "s";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function CanvasPlacedNode({
  node,
  lead,
  leftRailFieldIds,
  selected,
  canvasRef,
  onSelect,
  onDelete,
  onChange,
  onStagePreview,
}: {
  node: PlacedCanvasNode;
  lead: LeadRow;
  leftRailFieldIds: LeftRailFieldId[];
  selected: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onDelete: () => void;
  onChange: (patch: Record<string, unknown>) => void;
  onStagePreview?: (stage: string) => void;
}) {
  const nodeRef = useRef(node);
  nodeRef.current = node;

  const interaction = useRef<
    | { mode: "move"; px: number; py: number; x0: number; y0: number }
    | {
        mode: "resize";
        kind: ResizeEdgeKind;
        px: number;
        py: number;
        w0: number;
        h0: number;
        x0: number;
        y0: number;
      }
    | null
  >(null);
  const captureTargetRef = useRef<HTMLElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onPointerMoveInner = useRef<(e: PointerEvent) => void>(() => {});
  const onPointerUpInner = useRef<(e: PointerEvent) => void>(() => {});

  const onPointerMoveStable = useCallback((e: PointerEvent) => {
    onPointerMoveInner.current(e);
  }, []);

  const onPointerUpStable = useCallback((e: PointerEvent) => {
    onPointerUpInner.current(e);
  }, []);

  onPointerMoveInner.current = (e: PointerEvent) => {
    const canvas = canvasRef.current;
    const state = interaction.current;
    if (!canvas || !state) return;
    const rect = canvas.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    const w = nodeRef.current;

    const { minW, minH } = canvasNodeMinBounds(w);
    if (state.mode === "move") {
      const dx = fx - state.px;
      const dy = fy - state.py;
      onChangeRef.current({
        x: clamp(state.x0 + dx, 0, 1 - w.w),
        y: clamp(state.y0 + dy, 0, 1 - w.h),
      });
    } else {
      const dw = fx - state.px;
      const dh = fy - state.py;
      const patch: Record<string, unknown> = {};
      if (state.kind === "se" || state.kind === "e") {
        patch.w = clamp(state.w0 + dw, minW, 1 - state.x0);
      }
      if (state.kind === "se" || state.kind === "s") {
        patch.h = clamp(state.h0 + dh, minH, 1 - state.y0);
      }
      onChangeRef.current(patch);
    }
  };

  onPointerUpInner.current = (e: PointerEvent) => {
    if (captureTargetRef.current?.hasPointerCapture(e.pointerId)) {
      try {
        captureTargetRef.current.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
    captureTargetRef.current = null;
    interaction.current = null;
    window.removeEventListener("pointermove", onPointerMoveStable);
    window.removeEventListener("pointerup", onPointerUpStable);
  };

  const startMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    interaction.current = {
      mode: "move",
      px: (e.clientX - rect.left) / rect.width,
      py: (e.clientY - rect.top) / rect.height,
      x0: node.x,
      y0: node.y,
    };
    captureTargetRef.current = e.currentTarget;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    window.addEventListener("pointermove", onPointerMoveStable);
    window.addEventListener("pointerup", onPointerUpStable);
  };

  const startResize =
    (kind: ResizeEdgeKind) => (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      onSelect();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      interaction.current = {
        mode: "resize",
        kind,
        px: (e.clientX - rect.left) / rect.width,
        py: (e.clientY - rect.top) / rect.height,
        w0: node.w,
        h0: node.h,
        x0: node.x,
        y0: node.y,
      };
      captureTargetRef.current = e.currentTarget;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      window.addEventListener("pointermove", onPointerMoveStable);
      window.addEventListener("pointerup", onPointerUpStable);
    };

  const compact = canvasNodeIsCompactLayout(node);
  const omitChromeHeader = canvasNodeOmitsChromeHeader(node);
  const resizeInset = omitChromeHeader ? "top-1" : compact ? "top-7" : "top-9";
  const resizeBottom = omitChromeHeader ? "bottom-5" : "bottom-9";

  return (
    <div
      role="presentation"
      className={`isolate absolute flex h-full select-none flex-col bg-white/95 backdrop-blur-sm transition-shadow ${
        omitChromeHeader
          ? `overflow-hidden rounded-lg border shadow-sm ${
              selected ? "border-[#34369C] ring-1 ring-[#34369C]/25" : "border-slate-200/90"
            }`
          : compact
            ? `rounded-lg border shadow-sm ${
                selected ? "border-[#34369C] ring-1 ring-[#34369C]/25" : "border-slate-200/90"
              }`
            : `rounded-xl border-2 shadow-lg ${
                selected ? "border-[#34369C] shadow-[0_8px_28px_-8px_rgba(52,54,156,0.35)]" : "border-slate-300/80"
              }`
      }`}
      style={{
        left: `${node.x * 100}%`,
        top: `${node.y * 100}%`,
        width: `${node.w * 100}%`,
        height: `${node.h * 100}%`,
        zIndex: node.z,
        touchAction: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {!omitChromeHeader ? (
        <div
          className={`relative z-30 flex shrink-0 touch-none items-center gap-0.5 border-b border-slate-200/80 ${
            compact ? "h-6 min-h-[1.5rem] rounded-t-md bg-slate-50/95 px-1 py-0" : "rounded-t-[10px] bg-gradient-to-r from-[#f4f5ff] to-white px-1.5 py-0.5"
          }`}
          style={
            node.type === "widget"
              ? {
                  background: node.headerStyle?.backgroundColor ?? "linear-gradient(to right, #f4f5ff, white)",
                  color: node.headerStyle?.color,
                }
              : compact
                ? undefined
                : { background: "linear-gradient(to right, #f4f5ff, white)" }
          }
        >
          <div
            onPointerDown={startMove}
            className={`flex min-w-0 flex-1 cursor-grab items-center active:cursor-grabbing ${compact ? "py-0" : "gap-1 py-0.5"}`}
          >
            <span
              className={`min-w-0 truncate font-outfit font-semibold text-[#1F1750] ${compact ? "text-[9px]" : "text-[10px]"}`}
              style={node.type === "widget" && node.headerStyle?.color ? { color: node.headerStyle.color } : undefined}
            >
              {canvasNodeChromeTitle(node)}
            </span>
            {!compact ? (
              <span className="shrink-0 font-outfit text-[9px] font-medium text-[#8b87a8]">{node.type}</span>
            ) : null}
          </div>
          {selected ? (
            <button
              type="button"
              aria-label="Remove item"
              title="Remove"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={`inline-flex shrink-0 rounded-md border border-red-200/90 bg-white text-red-600 shadow-sm hover:bg-red-50 ${compact ? "p-0.5" : "p-1"}`}
            >
              <MdDeleteOutline size={compact ? 12 : 14} aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}
      <div
        onPointerDown={omitChromeHeader ? startMove : undefined}
        className={`relative z-0 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden touch-none ${
          omitChromeHeader ? "cursor-grab rounded-lg active:cursor-grabbing" : compact ? "rounded-b-md" : "rounded-b-[10px]"
        }`}
      >
        <DetailsCanvasNodeView
          node={node}
          lead={lead}
          leftRailFieldIds={leftRailFieldIds}
          onStagePreview={onStagePreview}
        />
        {omitChromeHeader && selected ? (
          <button
            type="button"
            aria-label="Remove field"
            title="Remove"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute bottom-1 right-1 z-40 inline-flex rounded-md border border-red-200/90 bg-white/95 p-0.5 text-red-600 shadow-sm backdrop-blur-sm hover:bg-red-50"
          >
            <MdDeleteOutline size={12} aria-hidden />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Resize width"
        onPointerDown={startResize("e")}
        className={`pointer-events-auto absolute right-0 ${resizeInset} ${resizeBottom} z-20 w-2 cursor-ew-resize touch-none border-0 bg-transparent p-0 outline-none`}
      />
      <button
        type="button"
        aria-label="Resize height"
        onPointerDown={startResize("s")}
        className={`pointer-events-auto absolute bottom-0 left-2 z-20 h-2 cursor-ns-resize touch-none border-0 bg-transparent p-0 outline-none ${omitChromeHeader ? "right-6" : "right-9"}`}
      />
      <button
        type="button"
        aria-label="Resize"
        onPointerDown={startResize("se")}
        className={`pointer-events-auto absolute right-0 bottom-0 z-30 flex cursor-nwse-resize touch-none items-end justify-end border-0 bg-transparent p-0 outline-none ${compact ? "h-7 w-7" : "h-9 w-9"}`}
      >
        <span
          className={`mb-0.5 mr-0.5 block rounded-sm border-2 border-[#34369C]/50 bg-white shadow-md ring-1 ring-white/90 ${compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"}`}
          aria-hidden
        />
      </button>
    </div>
  );
}
