"use client";

import { type DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BsGripVertical } from "react-icons/bs";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdSave } from "react-icons/md";
import {
  defaultLeftRailFieldConfig,
  loadLeftRailFieldConfigFromStorage,
  saveLeftRailFieldConfigToStorage,
} from "@/lib/left-rail-field-config";
import { LEFT_RAIL_FIELD_DEFINITIONS, type LeftRailFieldId } from "@/lib/left-rail-field-registry";

function moveIndex<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export type LeadRailFieldConfiguratorPanelProps = {
  storageKey: string;
  changeEvent: string;
  intro: string;
  /** Fired whenever visible field order changes (including after load from storage). */
  onVisibleIdsChange: (ids: LeftRailFieldId[]) => void;
};

export function LeadRailFieldConfiguratorPanel({
  storageKey,
  changeEvent,
  intro,
  onVisibleIdsChange,
}: LeadRailFieldConfiguratorPanelProps) {
  const [orderedIds, setOrderedIds] = useState<LeftRailFieldId[]>(() => defaultLeftRailFieldConfig().orderedIds);
  const [hiddenIds, setHiddenIds] = useState<LeftRailFieldId[]>(() => defaultLeftRailFieldConfig().hiddenIds);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const cfg = loadLeftRailFieldConfigFromStorage(storageKey);
      setOrderedIds(cfg.orderedIds);
      setHiddenIds(cfg.hiddenIds);
      setHydrated(true);
    });
    return () => cancelAnimationFrame(id);
  }, [storageKey]);

  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);

  const orderedVisibleIds = useMemo(
    () => orderedIds.filter((id) => !hiddenSet.has(id)),
    [orderedIds, hiddenSet],
  );

  useEffect(() => {
    if (!hydrated) return;
    onVisibleIdsChange(orderedVisibleIds);
  }, [hydrated, orderedVisibleIds, onVisibleIdsChange]);

  const labelById = useMemo(() => {
    const m = new Map<LeftRailFieldId, string>();
    for (const d of LEFT_RAIL_FIELD_DEFINITIONS) m.set(d.id, d.label);
    return m;
  }, []);

  const toggleFieldVisibility = useCallback((id: LeftRailFieldId) => {
    setHiddenIds((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return [...s];
    });
  }, []);

  const onDragOverRow = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDropOnRow = useCallback((dropIndex: number) => {
    return (e: DragEvent) => {
      e.preventDefault();
      const from = Number(e.dataTransfer.getData("text/plain"));
      if (Number.isNaN(from) || from === dropIndex) return;
      setOrderedIds((prev) => moveIndex(prev, from, dropIndex));
    };
  }, []);

  const saveFields = useCallback(() => {
    const d = defaultLeftRailFieldConfig();
    const next: { orderedIds: LeftRailFieldId[]; hiddenIds: LeftRailFieldId[] } =
      orderedIds.length > 0 ? { orderedIds, hiddenIds } : { orderedIds: d.orderedIds, hiddenIds: d.hiddenIds };
    saveLeftRailFieldConfigToStorage(storageKey, next, changeEvent);
    setOrderedIds(next.orderedIds);
    setHiddenIds(next.hiddenIds);
  }, [orderedIds, hiddenIds, storageKey, changeEvent]);

  const resetFields = useCallback(() => {
    const d = defaultLeftRailFieldConfig();
    setOrderedIds(d.orderedIds);
    setHiddenIds(d.hiddenIds);
    saveLeftRailFieldConfigToStorage(storageKey, d, changeEvent);
  }, [storageKey, changeEvent]);

  const showAllFields = useCallback(() => {
    setHiddenIds([]);
  }, []);

  return (
    <div className="rounded-xl border border-[#34369C]/20 bg-gradient-to-br from-[#f4f5ff] to-white p-2.5 shadow-sm">
      <h2 className="font-outfit text-xs font-semibold uppercase tracking-wide text-[#6b6578]">
        Left rail fields
      </h2>
      <p className="mt-0.5 font-outfit text-[10px] leading-snug text-[#8b87a8]">{intro}</p>

      {!hydrated ? (
        <p className="mt-2 font-outfit text-xs text-[#8b87a8]">Loading…</p>
      ) : (
        <>
          <ul
            className="mt-2 max-h-[min(40vh,360px)] space-y-px overflow-y-auto rounded-md border border-slate-100 bg-slate-50/80 py-0.5 [scrollbar-width:thin]"
            role="list"
          >
            {orderedIds.map((id, index) => {
              const hidden = hiddenSet.has(id);
              return (
                <li
                  key={id}
                  onDragOver={onDragOverRow}
                  onDrop={onDropOnRow(index)}
                  className="flex min-h-[1.625rem] items-center gap-1 px-1"
                >
                  <button
                    type="button"
                    draggable
                    aria-label={`Reorder ${labelById.get(id) ?? id}`}
                    className="-ml-0.5 inline-flex shrink-0 cursor-grab touch-none rounded border-0 bg-transparent p-0.5 text-[#b4b8c4] active:cursor-grabbing"
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(index));
                    }}
                  >
                    <BsGripVertical size={14} aria-hidden />
                  </button>
                  <span
                    className={`min-w-0 flex-1 truncate font-outfit text-[11px] leading-tight ${
                      hidden ? "font-normal text-[#b0aec4]" : "font-semibold text-[#1F1750]"
                    }`}
                  >
                    {labelById.get(id) ?? id}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleFieldVisibility(id)}
                    className={`inline-flex shrink-0 rounded p-0.5 transition-colors ${
                      hidden
                        ? "text-[#b0aec4] hover:bg-slate-200/60 hover:text-[#8b87a8]"
                        : "text-[#34369C] hover:bg-[#34369C]/10"
                    }`}
                    aria-label={hidden ? `Show ${labelById.get(id) ?? id}` : `Hide ${labelById.get(id) ?? id}`}
                    title={hidden ? "Show in left rail" : "Hide from left rail"}
                  >
                    {hidden ? <FiEyeOff size={15} strokeWidth={2} aria-hidden /> : <FiEye size={15} strokeWidth={2} aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={saveFields}
              className="inline-flex items-center gap-1 rounded-lg bg-[#34369C] px-2 py-1.5 font-outfit text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
            >
              <MdSave size={14} aria-hidden />
              Save layout
            </button>
            <button
              type="button"
              onClick={showAllFields}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-outfit text-[11px] font-semibold text-[#34369C] hover:bg-[#f4f5ff]"
            >
              Show all fields
            </button>
            <button
              type="button"
              onClick={resetFields}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-outfit text-[11px] font-semibold text-[#5c5878] hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
          <p className="mt-1.5 font-outfit text-[9px] leading-snug text-[#a8a4b8]">
            <code className="rounded bg-slate-100 px-0.5">localStorage</code> in this browser.
          </p>
        </>
      )}
    </div>
  );
}
