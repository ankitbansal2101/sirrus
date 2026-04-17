"use client";

import { type DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import { BsGripVertical } from "react-icons/bs";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdClose, MdSave, MdSearch } from "react-icons/md";
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
  /** Fired whenever visible field order changes (including after load from storage). */
  onVisibleIdsChange: (ids: LeftRailFieldId[]) => void;
};

export function LeadRailFieldConfiguratorPanel({
  storageKey,
  changeEvent,
  onVisibleIdsChange,
}: LeadRailFieldConfiguratorPanelProps) {
  const [orderedIds, setOrderedIds] = useState<LeftRailFieldId[]>(() => defaultLeftRailFieldConfig().orderedIds);
  const [hiddenIds, setHiddenIds] = useState<LeftRailFieldId[]>(() => defaultLeftRailFieldConfig().hiddenIds);
  const [hydrated, setHydrated] = useState(false);
  const [fieldSearch, setFieldSearch] = useState("");

  useEffect(() => {
    setFieldSearch("");
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

  const searchNorm = fieldSearch.trim().toLowerCase();
  const searchActive = searchNorm.length > 0;

  const filteredRows = useMemo(() => {
    const rows = orderedIds.map((id, index) => ({ id, index }));
    if (!searchNorm) return rows;
    return rows.filter(({ id }) => {
      const def = LEFT_RAIL_FIELD_DEFINITIONS.find((d) => d.id === id);
      const label = (def?.label ?? labelById.get(id) ?? id).toLowerCase();
      const hint = (def?.hint ?? "").toLowerCase();
      const key = id.toLowerCase();
      return label.includes(searchNorm) || key.includes(searchNorm) || hint.includes(searchNorm);
    });
  }, [orderedIds, searchNorm, labelById]);

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
    <div className="min-w-0 space-y-2" aria-label="Left rail field configuration">
      {!hydrated ? (
        <p className="font-outfit text-xs text-[#8b87a8]">Loading…</p>
      ) : (
        <>
          <div className="relative">
            <MdSearch
              className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8a4b8]"
              aria-hidden
            />
            <input
              type="search"
              value={fieldSearch}
              onChange={(e) => setFieldSearch(e.target.value)}
              placeholder="Search fields…"
              aria-label="Search left rail fields by name or id"
              className="w-full rounded-md border border-slate-200/90 bg-white py-1.5 pr-8 pl-8 font-outfit text-[11px] text-[#1F1750] shadow-sm outline-none transition-colors placeholder:text-[#a8a4b8] focus:border-[#34369C]/40 focus:ring-1 focus:ring-[#34369C]/15"
            />
            {searchActive ? (
              <button
                type="button"
                onClick={() => setFieldSearch("")}
                className="absolute right-1 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#8b87a8] transition-colors hover:bg-slate-100 hover:text-[#1F1750]"
                aria-label="Clear field search"
              >
                <MdClose size={18} aria-hidden />
              </button>
            ) : null}
          </div>
          {searchActive ? (
            <p className="mt-1 font-outfit text-[9px] leading-snug text-[#a8a4b8]">
              Drag reorder is off while search is active. Clear search to reorder.
            </p>
          ) : null}

          <ul
            className="mt-2 max-h-[min(40vh,360px)] space-y-px overflow-y-auto rounded-md border border-slate-100 bg-slate-50/80 py-0.5 [scrollbar-width:thin]"
            role="list"
            aria-label="Left rail field list"
          >
            {filteredRows.length === 0 ? (
              <li className="px-2 py-3 text-center font-outfit text-[11px] text-[#8b87a8]">No fields match your search.</li>
            ) : null}
            {filteredRows.map(({ id, index }) => {
              const hidden = hiddenSet.has(id);
              return (
                <li
                  key={id}
                  onDragOver={searchActive ? undefined : onDragOverRow}
                  onDrop={searchActive ? undefined : onDropOnRow(index)}
                  className="flex min-h-[1.625rem] items-center gap-1 rounded-md px-1 pr-2 hover:bg-slate-50/80"
                >
                  <button
                    type="button"
                    draggable={!searchActive}
                    aria-label={`Reorder ${labelById.get(id) ?? id}`}
                    aria-disabled={searchActive}
                    className={`-ml-0.5 inline-flex shrink-0 touch-none rounded border-0 bg-transparent p-0.5 text-[#b4b8c4] ${
                      searchActive ? "cursor-not-allowed opacity-40" : "cursor-grab active:cursor-grabbing"
                    }`}
                    onDragStart={
                      searchActive
                        ? undefined
                        : (e) => {
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData("text/plain", String(index));
                          }
                    }
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
