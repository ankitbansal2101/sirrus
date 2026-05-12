"use client";

import { labelForLeftRailFieldId } from "@/lib/canvas-field-display";
import { ALL_TASK_WIDGET_COLUMNS, DEFAULT_TASK_WIDGET_COLUMNS } from "@/lib/widget-canvas-task-defaults";
import type { PlacedCanvasNode, TaskWidgetColumnId } from "@/lib/widget-canvas-v2-types";

type Props = {
  node: PlacedCanvasNode | null;
  onPatch: (patch: Record<string, unknown>) => void;
};

function labelInput(id: string, label: string, value: string, onChange: (v: string) => void) {
  return (
    <label className="flex flex-col gap-0.5" htmlFor={id}>
      <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">{label}</span>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-200/90 bg-white px-1.5 py-1 font-outfit text-[11px] text-[#1F1750]"
      />
    </label>
  );
}

function numInput(id: string, label: string, value: number | undefined, onChange: (v: number | undefined) => void) {
  return (
    <label className="flex flex-col gap-0.5" htmlFor={id}>
      <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">{label}</span>
      <input
        id={id}
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const t = e.target.value;
          onChange(t === "" ? undefined : Number(t));
        }}
        className="rounded-md border border-slate-200/90 bg-white px-1.5 py-1 font-outfit text-[11px] text-[#1F1750]"
      />
    </label>
  );
}

function colorInput(id: string, label: string, value: string | undefined, onChange: (v: string) => void) {
  return (
    <label className="flex flex-col gap-0.5" htmlFor={id}>
      <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">{label}</span>
      <input
        id={id}
        type="color"
        value={value?.startsWith("#") && value.length === 7 ? value : "#f4f5ff"}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full cursor-pointer rounded-md border border-slate-200/90 bg-white"
      />
    </label>
  );
}

export function DetailsPageStylePanel({ node, onPatch }: Props) {
  if (!node) {
    return (
      <p className="px-1 font-outfit text-[10px] leading-relaxed text-[#8b87a8]">
        Select a canvas item to edit styles and widget columns.
      </p>
    );
  }

  if (node.type === "section") {
    const s = node.style ?? {};
    return (
      <div className="flex flex-col gap-2 px-0.5">
        {labelInput("sec-label", "Section label", node.label ?? "", (v) => onPatch({ label: v || undefined }))}
        {colorInput("sec-bg", "Background", s.backgroundColor, (v) => onPatch({ style: { ...s, backgroundColor: v } }))}
        {colorInput("sec-border", "Border color", s.borderColor, (v) => onPatch({ style: { ...s, borderColor: v } }))}
        {numInput("sec-bw", "Border width (px)", s.borderWidthPx, (v) => onPatch({ style: { ...s, borderWidthPx: v } }))}
        {numInput("sec-pad", "Padding (px)", s.paddingPx, (v) => onPatch({ style: { ...s, paddingPx: v } }))}
        {numInput("sec-rad", "Radius (px)", s.borderRadiusPx, (v) => onPatch({ style: { ...s, borderRadiusPx: v } }))}
      </div>
    );
  }

  if (node.type === "text") {
    const ts = node.textStyle ?? {};
    return (
      <div className="flex flex-col gap-2 px-0.5">
        <label className="flex flex-col gap-0.5" htmlFor="txt-content">
          <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">Content</span>
          <textarea
            id="txt-content"
            value={ts.content ?? "Text"}
            onChange={(e) => onPatch({ textStyle: { ...ts, content: e.target.value } })}
            rows={3}
            className="resize-y rounded-md border border-slate-200/90 bg-white px-1.5 py-1 font-outfit text-[11px] text-[#1F1750]"
          />
        </label>
        {numInput("txt-fs", "Font size (px)", ts.fontSizePx, (v) => onPatch({ textStyle: { ...ts, fontSizePx: v } }))}
        {colorInput("txt-fg", "Text color", ts.color, (v) => onPatch({ textStyle: { ...ts, color: v } }))}
        {colorInput("txt-bg", "Background", ts.backgroundColor, (v) => onPatch({ textStyle: { ...ts, backgroundColor: v } }))}
        <label className="flex flex-col gap-0.5" htmlFor="txt-ff">
          <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">Font</span>
          <select
            id="txt-ff"
            value={ts.fontFamily ?? ""}
            onChange={(e) => onPatch({ textStyle: { ...ts, fontFamily: e.target.value || undefined } })}
            className="rounded-md border border-slate-200/90 bg-white px-1.5 py-1 font-outfit text-[11px]"
          >
            <option value="">Default</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="system-ui, sans-serif">System UI</option>
            <option value="ui-monospace, monospace">Mono</option>
          </select>
        </label>
      </div>
    );
  }

  if (node.type === "line") {
    const ls = node.lineStyle ?? { orientation: "horizontal" as const };
    return (
      <div className="flex flex-col gap-2 px-0.5">
        <label className="flex flex-col gap-0.5" htmlFor="ln-or">
          <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">Placement</span>
          <select
            id="ln-or"
            value={ls.orientation ?? "horizontal"}
            onChange={(e) =>
              onPatch({
                lineStyle: { ...ls, orientation: e.target.value as "horizontal" | "vertical" },
              })
            }
            className="rounded-md border border-slate-200/90 bg-white px-1.5 py-1 font-outfit text-[11px]"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </label>
        {numInput("ln-th", "Thickness (px)", ls.thicknessPx, (v) => onPatch({ lineStyle: { ...ls, thicknessPx: v } }))}
        {colorInput("ln-c", "Color", ls.color, (v) => onPatch({ lineStyle: { ...ls, color: v } }))}
      </div>
    );
  }

  if (node.type === "icon") {
    const ic = node.iconStyle ?? {};
    return (
      <div className="flex flex-col gap-2 px-0.5">
        <label className="flex flex-col gap-0.5" htmlFor="ic-g">
          <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">Glyph</span>
          <select
            id="ic-g"
            value={ic.glyph ?? "star"}
            onChange={(e) =>
              onPatch({
                iconStyle: { ...ic, glyph: e.target.value as "star" | "phone" | "calendar" | "user" },
              })
            }
            className="rounded-md border border-slate-200/90 bg-white px-1.5 py-1 font-outfit text-[11px]"
          >
            <option value="star">Star</option>
            <option value="phone">Phone</option>
            <option value="calendar">Calendar</option>
            <option value="user">User</option>
          </select>
        </label>
        {colorInput("ic-fg", "Icon color", ic.iconColor, (v) => onPatch({ iconStyle: { ...ic, iconColor: v } }))}
        {colorInput("ic-bg", "Background", ic.backgroundColor, (v) => onPatch({ iconStyle: { ...ic, backgroundColor: v } }))}
      </div>
    );
  }

  if (node.type === "field") {
    const ls = node.labelStyle ?? {};
    const vs = node.valueStyle ?? {};
    return (
      <div className="flex max-h-[min(50vh,420px)] flex-col gap-3 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        <p className="font-outfit text-[10px] font-semibold text-[#1F1750]">{labelForLeftRailFieldId(node.fieldId)}</p>
        <div>
          <p className="mb-1 font-outfit text-[9px] font-semibold uppercase tracking-wide text-[#8b87a8]">Label</p>
          <div className="flex flex-col gap-1.5">
            {numInput("fl-fs", "Size (px)", ls.fontSizePx, (v) => onPatch({ labelStyle: { ...ls, fontSizePx: v } }))}
            {colorInput("fl-fg", "Color", ls.color, (v) => onPatch({ labelStyle: { ...ls, color: v } }))}
            {colorInput("fl-bg", "Background", ls.backgroundColor, (v) => onPatch({ labelStyle: { ...ls, backgroundColor: v } }))}
            <label className="flex flex-col gap-0.5" htmlFor="fl-tt">
              <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">Case</span>
              <select
                id="fl-tt"
                value={ls.textTransform ?? "none"}
                onChange={(e) =>
                  onPatch({ labelStyle: { ...ls, textTransform: e.target.value as "none" | "uppercase" | "lowercase" } })
                }
                className="rounded-md border border-slate-200/90 bg-white px-1.5 py-1 font-outfit text-[11px]"
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
              </select>
            </label>
          </div>
        </div>
        <div>
          <p className="mb-1 font-outfit text-[9px] font-semibold uppercase tracking-wide text-[#8b87a8]">Value</p>
          <div className="flex flex-col gap-1.5">
            {numInput("fv-fs", "Size (px)", vs.fontSizePx, (v) => onPatch({ valueStyle: { ...vs, fontSizePx: v } }))}
            {colorInput("fv-fg", "Color", vs.color, (v) => onPatch({ valueStyle: { ...vs, color: v } }))}
            {colorInput("fv-bg", "Background", vs.backgroundColor, (v) => onPatch({ valueStyle: { ...vs, backgroundColor: v } }))}
            <label className="flex flex-col gap-0.5" htmlFor="fv-tt">
              <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">Case</span>
              <select
                id="fv-tt"
                value={vs.textTransform ?? "none"}
                onChange={(e) =>
                  onPatch({ valueStyle: { ...vs, textTransform: e.target.value as "none" | "uppercase" | "lowercase" } })
                }
                className="rounded-md border border-slate-200/90 bg-white px-1.5 py-1 font-outfit text-[11px]"
              >
                <option value="none">None</option>
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
              </select>
            </label>
            <label className="flex flex-col gap-0.5" htmlFor="fv-al">
              <span className="font-outfit text-[9px] font-semibold text-[#6b6578]">Align</span>
              <select
                id="fv-al"
                value={vs.align ?? "start"}
                onChange={(e) =>
                  onPatch({ valueStyle: { ...vs, align: e.target.value as "start" | "center" | "end" } })
                }
                className="rounded-md border border-slate-200/90 bg-white px-1.5 py-1 font-outfit text-[11px]"
              >
                <option value="start">Start</option>
                <option value="center">Center</option>
                <option value="end">End</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  }

  if (node.type === "widget") {
    const w = node;
    const activeTaskCols =
      w.kind === "open-tasks"
        ? w.columns?.taskColumns?.length
          ? w.columns.taskColumns
          : [...DEFAULT_TASK_WIDGET_COLUMNS]
        : [];
    const setTaskColumns = (next: TaskWidgetColumnId[]) => {
      if (next.length < 1) return;
      onPatch({ columns: { taskColumns: next } });
    };
    const toggleCol = (c: TaskWidgetColumnId) => {
      if (w.kind !== "open-tasks") return;
      if (activeTaskCols.includes(c)) {
        if (activeTaskCols.length <= 1) return;
        setTaskColumns(activeTaskCols.filter((x) => x !== c));
      } else {
        setTaskColumns([...activeTaskCols, c]);
      }
    };
    const moveTask = (idx: number, dir: -1 | 1) => {
      if (w.kind !== "open-tasks") return;
      const j = idx + dir;
      if (j < 0 || j >= activeTaskCols.length) return;
      const next = [...activeTaskCols];
      [next[idx], next[j]] = [next[j], next[idx]];
      setTaskColumns(next);
    };
    return (
      <div className="flex max-h-[min(50vh,480px)] flex-col gap-3 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
        <div>
          <p className="mb-1 font-outfit text-[9px] font-semibold uppercase tracking-wide text-[#8b87a8]">Widget chrome</p>
          {colorInput("wh-hbg", "Header background", w.headerStyle?.backgroundColor, (v) =>
            onPatch({ headerStyle: { ...w.headerStyle, backgroundColor: v } }),
          )}
          {colorInput("wh-ht", "Header text", w.headerStyle?.color, (v) =>
            onPatch({ headerStyle: { ...w.headerStyle, color: v } }),
          )}
          {colorInput("wh-bbg", "Body background", w.bodyBackgroundColor, (v) => onPatch({ bodyBackgroundColor: v }))}
          {numInput("wh-gap", "Row gap (px)", w.rowGapPx, (v) => onPatch({ rowGapPx: v }))}
        </div>
        {w.kind === "open-tasks" ? (
          <div>
            <p className="mb-1 font-outfit text-[9px] font-semibold uppercase tracking-wide text-[#8b87a8]">
              Task columns
            </p>
            <p className="mb-1.5 font-outfit text-[9px] text-[#a8a4b8]">At least one column · reorder with arrows.</p>
            <ul className="space-y-1">
              {activeTaskCols.map((c, idx) => (
                <li
                  key={`${c}-${idx}`}
                  className="flex items-center gap-1 rounded-md border border-slate-200/80 bg-white px-1.5 py-1 font-outfit text-[10px]"
                >
                  <span className="min-w-0 flex-1 font-medium text-[#1F1750]">{c}</span>
                  <button type="button" className="rounded border px-1 text-[9px]" onClick={() => moveTask(idx, -1)}>
                    ↑
                  </button>
                  <button type="button" className="rounded border px-1 text-[9px]" onClick={() => moveTask(idx, 1)}>
                    ↓
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-1">
              {ALL_TASK_WIDGET_COLUMNS.map((c) => (
                <label
                  key={c}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200/90 bg-white px-2 py-0.5 font-outfit text-[9px]"
                >
                  <input type="checkbox" checked={activeTaskCols.includes(c)} onChange={() => toggleCol(c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}
