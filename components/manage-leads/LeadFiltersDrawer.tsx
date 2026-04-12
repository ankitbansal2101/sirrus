"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";
import { IoChevronBack } from "react-icons/io5";
import { LEAD_STAGE_OPTIONS } from "@/lib/lead-stage-options";

const PANEL_BG = "rgb(227, 227, 227)";
const HEADER_BG = "rgba(248, 248, 248, 0.698)";
const SCROLL_BG = "rgb(228, 229, 230)";
const FIELD_BG = "rgb(228, 229, 230)";
const ACCENT = "rgb(52, 54, 156)";
const LABEL = "rgb(126, 122, 149)";
const PLACEHOLDER = "rgb(188, 188, 188)";
const TEXT = "rgb(31, 23, 80)";

const CATEGORIES = ["Residential", "Commercial", "Plot", "Villa"] as const;
const SOURCES = ["Digital Marketing", "Walk-in", "Referral", "Channel Partner"] as const;
const SUB_SOURCES = ["Facebook", "LinkedIn", "Google", "Instagram"] as const;
const ASSIGNED = ["ST", "AB", "CD", "All"] as const;
const LEAD_LABELS = ["Hot", "Warm", "Cold", "VIP"] as const;
const SITE_VISIT_SUB = ["Scheduled", "Completed", "No-show", "Rescheduled"] as const;
const REVISITS = ["0", "1", "2", "3+"] as const;
const DROPPED_REASONS = ["Budget", "Location", "Not interested", "Competitor"] as const;

function CalendarIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-[#7e7a95]"
      aria-hidden
    >
      <path d="M12.5 21h-6.5a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
      <path d="M16 3v4M8 3v4M4 11h16M16 19h6M19 16v6" />
    </svg>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex justify-between pl-5">
      <span className="text-sm font-normal" style={{ color: LABEL }}>
        {children}
      </span>
    </div>
  );
}

function DatePill({
  placeholder,
  disabled,
  value,
  onChange,
}: {
  placeholder: string;
  disabled?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="relative h-10 w-[47%] min-w-0"
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <label className="flex h-[38px] w-full cursor-pointer items-center justify-between rounded-full border-2 px-4 text-sm font-normal has-[:disabled]:cursor-not-allowed"
        style={{
          backgroundColor: FIELD_BG,
          borderColor: FIELD_BG,
          color: TEXT,
        }}
      >
        <span style={{ color: value ? TEXT : "rgb(183, 182, 202)" }} className="truncate">
          {value || placeholder}
        </span>
        <CalendarIcon />
        <input
          type="date"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </label>
    </div>
  );
}

function DateRangeRow({
  from,
  to,
  onFrom,
  onTo,
  disableTo,
}: {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  disableTo?: boolean;
}) {
  return (
    <div className="flex w-full flex-row justify-between gap-3">
      <DatePill placeholder="From Date" value={from} onChange={onFrom} />
      <DatePill placeholder="To Date" value={to} onChange={onTo} disabled={disableTo && !from} />
    </div>
  );
}

function toggleInList(list: string[], item: string): string[] {
  if (list.includes(item)) return list.filter((x) => x !== item);
  return [...list, item];
}

function MultiSelectPill({
  dropdownId,
  openDropdown,
  setOpenDropdown,
  values,
  placeholder,
  options,
  disabled,
  onChange,
  border2,
}: {
  dropdownId: string;
  openDropdown: string | null;
  setOpenDropdown: (id: string | null) => void;
  values: string[];
  placeholder: string;
  options: readonly string[];
  disabled?: boolean;
  onChange: (next: string[]) => void;
  border2?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const open = openDropdown === dropdownId && !disabled;

  const updateMenuPos = useCallback(() => {
    if (!rootRef.current) return;
    const r = rootRef.current.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    updateMenuPos();
    const ro = new ResizeObserver(updateMenuPos);
    if (rootRef.current) ro.observe(rootRef.current);
    window.addEventListener("scroll", updateMenuPos, true);
    window.addEventListener("resize", updateMenuPos);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", updateMenuPos, true);
      window.removeEventListener("resize", updateMenuPos);
    };
  }, [open, updateMenuPos]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpenDropdown(null);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, setOpenDropdown]);

  const menu =
    open && menuPos ? (
      <ul
        ref={menuRef}
        role="listbox"
        aria-multiselectable="true"
        className="max-h-52 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white py-1 shadow-lg [scrollbar-width:thin]"
        style={{
          position: "fixed",
          top: menuPos.top,
          left: menuPos.left,
          width: menuPos.width,
          zIndex: 1002,
        }}
      >
        {options.map((opt) => {
          const checked = values.includes(opt);
          return (
            <li key={opt} role="option" aria-selected={checked}>
              <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[#f4f5fc]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange(toggleInList(values, opt))}
                  className="h-4 w-4 shrink-0 rounded border-slate-300 accent-[#34369C]"
                />
                <span className="min-w-0 text-[#1F1750]">{opt}</span>
              </label>
            </li>
          );
        })}
      </ul>
    ) : null;

  const toggleOpen = () => {
    if (disabled) return;
    setOpenDropdown(open ? null : dropdownId);
  };

  return (
    <>
      <div ref={rootRef} className="relative z-0">
        <div
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          className={`flex w-full min-h-10 items-stretch gap-1 rounded-2xl text-left outline-none ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
          style={{
            backgroundColor: FIELD_BG,
            borderColor: FIELD_BG,
            borderWidth: border2 ? 2 : 1,
            borderStyle: "solid",
          }}
          onClick={toggleOpen}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleOpen();
            }
          }}
          tabIndex={disabled ? -1 : 0}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 py-1.5 pl-4">
            {values.length === 0 ? (
              <span className="text-base font-medium" style={{ color: PLACEHOLDER }}>
                {placeholder}
              </span>
            ) : (
              values.map((v) => (
                <span
                  key={v}
                  className="inline-flex max-w-full items-center gap-0.5 rounded-full border border-white/80 bg-white px-1 pl-2.5 text-xs font-semibold shadow-sm"
                  style={{ color: TEXT }}
                >
                  <span className="max-w-[9rem] truncate" title={v}>
                    {v}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${v}`}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#5c5878] transition-colors hover:bg-[#e8eaf2] hover:text-[#1F1750]"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(values.filter((x) => x !== v));
                    }}
                  >
                    <MdClose size={16} />
                  </button>
                </span>
              ))
            )}
          </div>
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label={open ? "Close options" : "Open options"}
            className="flex shrink-0 items-center justify-center self-center px-2 py-2"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              toggleOpen();
            }}
          >
            <MdKeyboardArrowDown
              size={border2 ? 24 : 28}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              style={{ color: "#5c5878" }}
            />
          </button>
        </div>
      </div>
      {typeof document !== "undefined" && menu ? createPortal(menu, document.body) : null}
    </>
  );
}

const SCORE_LABELS = ["NA", "1", "2", "3", "4", "5"] as const;

function ScoreRangeBlock({ title }: { title: string }) {
  const [minIdx, setMinIdx] = useState(0);
  const [maxIdx, setMaxIdx] = useState(5);

  return (
    <div className="mt-4 px-4">
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-sm font-normal" style={{ color: LABEL }}>
          {title}
        </span>
      </div>
      <div className="touch-none space-y-3 px-2">
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-xs font-medium" style={{ color: LABEL }}>
            Min
          </span>
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={minIdx}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMinIdx(Math.min(v, maxIdx));
            }}
            className="h-2 w-full flex-1 cursor-pointer accent-[#34369C]"
            style={{ accentColor: ACCENT }}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-10 shrink-0 text-xs font-medium" style={{ color: LABEL }}>
            Max
          </span>
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={maxIdx}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMaxIdx(Math.max(v, minIdx));
            }}
            className="h-2 w-full flex-1 cursor-pointer"
            style={{ accentColor: ACCENT }}
          />
        </div>
        <div className="flex justify-between px-1 pt-1">
          {SCORE_LABELS.map((lab) => (
            <span key={lab} className="w-6 text-center text-xs font-medium text-[#b7b6ca]">
              {lab}
            </span>
          ))}
        </div>
      </div>
      <p className="px-5 pt-3 text-center text-sm font-medium" style={{ color: TEXT }}>
        Selected Score: {SCORE_LABELS[minIdx]}-{SCORE_LABELS[maxIdx]}
      </p>
    </div>
  );
}

export function LeadFiltersDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [missedDisp, setMissedDisp] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [leadCreateFrom, setLeadCreateFrom] = useState("");
  const [leadCreateTo, setLeadCreateTo] = useState("");
  const [leadUpdateFrom, setLeadUpdateFrom] = useState("");
  const [leadUpdateTo, setLeadUpdateTo] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [stage, setStage] = useState<string[]>([]);
  const [source, setSource] = useState<string[]>([]);
  const [subSource, setSubSource] = useState<string[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState("");
  const [followFrom, setFollowFrom] = useState("");
  const [followTo, setFollowTo] = useState("");
  const [leadLabel, setLeadLabel] = useState<string[]>([]);
  const [siteVisitFrom, setSiteVisitFrom] = useState("");
  const [siteVisitTo, setSiteVisitTo] = useState("");
  const [siteVisitSub, setSiteVisitSub] = useState<string[]>([]);
  const [revisits, setRevisits] = useState<string[]>([]);
  const [droppedReason, setDroppedReason] = useState<string[]>([]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) setOpenDropdown(null);
  }, [open]);

  const handleClear = useCallback(() => {
    setLeadCreateFrom("");
    setLeadCreateTo("");
    setLeadUpdateFrom("");
    setLeadUpdateTo("");
    setCategory([]);
    setStage([]);
    setSource([]);
    setSubSource([]);
    setAssigned([]);
    setMinBudget("");
    setFollowFrom("");
    setFollowTo("");
    setLeadLabel([]);
    setMissedDisp(false);
    setSiteVisitFrom("");
    setSiteVisitTo("");
    setSiteVisitSub([]);
    setRevisits([]);
    setDroppedReason([]);
    setOpenDropdown(null);
  }, []);

  const stageOptions = [...LEAD_STAGE_OPTIONS.map((s) => s.id), "Contacted", "New Lead"].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openDropdown) {
        setOpenDropdown(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, openDropdown]);

  if (!mounted || !open) return null;

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close filters"
        className="fixed inset-0 z-[1000] bg-black/25"
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 z-[1001] flex h-full max-h-screen w-11/12 max-w-full flex-col overflow-hidden shadow-lg transition-transform duration-300 sm:w-[85vw] md:w-[40vw]"
        style={{ backgroundColor: PANEL_BG }}
      >
        <div
          className="flex shrink-0 items-center justify-between px-5 py-4"
          style={{ backgroundColor: HEADER_BG }}
        >
          <div className="flex items-center">
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgb(216, 216, 216)" }}
              aria-label="Back"
            >
              <IoChevronBack size={18} color="#475467" />
            </button>
            <h1 className="ml-5 text-xl font-semibold" style={{ color: TEXT }}>
              Filters
            </h1>
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto p-5 pb-28 [scrollbar-width:thin]"
          style={{ backgroundColor: SCROLL_BG }}
        >
          <div className="flex-1 rounded-3xl bg-white p-6">
            <FieldLabel>Lead Creation Date</FieldLabel>
            <DateRangeRow
              from={leadCreateFrom}
              to={leadCreateTo}
              onFrom={setLeadCreateFrom}
              onTo={setLeadCreateTo}
              disableTo
            />

            <div className="mt-4">
              <FieldLabel>Lead Update Date</FieldLabel>
              <DateRangeRow
                from={leadUpdateFrom}
                to={leadUpdateTo}
                onFrom={setLeadUpdateFrom}
                onTo={setLeadUpdateTo}
                disableTo
              />
            </div>

            <div className="mt-4">
              <FieldLabel>Category</FieldLabel>
              <MultiSelectPill
                dropdownId="category"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                values={category}
                placeholder="Select here"
                options={CATEGORIES}
                onChange={setCategory}
                border2
              />
            </div>

            <div className="mt-4">
              <FieldLabel>Stage</FieldLabel>
              <MultiSelectPill
                dropdownId="stage"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                values={stage}
                placeholder="Select the Stage"
                options={stageOptions}
                onChange={setStage}
                border2
              />
            </div>

            <div className="mt-4">
              <FieldLabel>Source</FieldLabel>
              <MultiSelectPill
                dropdownId="source"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                values={source}
                placeholder="Select the Source"
                options={SOURCES}
                onChange={(next) => {
                  setSource(next);
                  if (next.length === 0) setSubSource([]);
                }}
              />
            </div>

            <div className="mt-4">
              <FieldLabel>Sub Source</FieldLabel>
              <MultiSelectPill
                dropdownId="subSource"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                values={subSource}
                placeholder="Select the Sub Source"
                options={SUB_SOURCES}
                onChange={setSubSource}
                disabled={source.length === 0}
              />
            </div>

            <div className="mt-4">
              <FieldLabel>Assigned to</FieldLabel>
              <MultiSelectPill
                dropdownId="assigned"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                values={assigned}
                placeholder="Select Assigned to"
                options={ASSIGNED}
                onChange={setAssigned}
              />
            </div>

            <div className="mt-4">
              <FieldLabel>Min Budget</FieldLabel>
              <div
                className="flex h-10 w-full items-center overflow-hidden rounded-full border-[1.5px] py-2.5 pr-2.5 pl-5"
                style={{ backgroundColor: FIELD_BG, borderColor: FIELD_BG }}
              >
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="Enter the budget"
                  className="no-spinner w-full border-none bg-transparent text-sm font-medium outline-none placeholder:text-[#BCBCBC]"
                  style={{ color: TEXT }}
                />
              </div>
            </div>

            <div className="mt-4">
              <FieldLabel>Next Follow Up Date</FieldLabel>
              <div className="mt-2">
                <DateRangeRow
                  from={followFrom}
                  to={followTo}
                  onFrom={setFollowFrom}
                  onTo={setFollowTo}
                  disableTo
                />
              </div>
            </div>

            <div className="mt-4">
              <FieldLabel>Lead Label</FieldLabel>
              <MultiSelectPill
                dropdownId="leadLabel"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                values={leadLabel}
                placeholder="Select here"
                options={LEAD_LABELS}
                onChange={setLeadLabel}
                border2
              />
            </div>

            <div className="mt-6 mb-2 flex flex-row items-center justify-between px-5">
              <span className="text-sm font-normal" style={{ color: LABEL }}>
                Missed Disposition
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={missedDisp}
                onClick={() => setMissedDisp((v) => !v)}
                className="flex h-6 w-11 shrink-0 items-center rounded-full px-1 transition-all duration-300"
                style={{ backgroundColor: missedDisp ? ACCENT : "rgb(199, 197, 211)" }}
              >
                <span
                  className="h-4 w-4 rounded-full bg-white transition-transform duration-300"
                  style={{ transform: missedDisp ? "translateX(1.25rem)" : "translateX(0)" }}
                />
              </button>
            </div>

            <ScoreRangeBlock title="Perception Score" />
            <ScoreRangeBlock title="Ability Score" />
            <ScoreRangeBlock title="Intent Score" />
            <ScoreRangeBlock title="Readiness Score" />

            <div className="mt-4">
              <FieldLabel>Site Visit scheduled date</FieldLabel>
              <div className="mt-2">
                <DateRangeRow
                  from={siteVisitFrom}
                  to={siteVisitTo}
                  onFrom={setSiteVisitFrom}
                  onTo={setSiteVisitTo}
                  disableTo
                />
              </div>
            </div>

            <div className="mt-4">
              <FieldLabel>Site Visit Sub Status</FieldLabel>
              <MultiSelectPill
                dropdownId="siteVisitSub"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                values={siteVisitSub}
                placeholder="Select sub status"
                options={SITE_VISIT_SUB}
                onChange={setSiteVisitSub}
                border2
              />
            </div>

            <div className="mt-4">
              <FieldLabel>Revisits Done</FieldLabel>
              <MultiSelectPill
                dropdownId="revisits"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                values={revisits}
                placeholder="Select here"
                options={REVISITS}
                onChange={setRevisits}
                border2
              />
            </div>

            <div className="mt-4">
              <FieldLabel>Dropped Reason</FieldLabel>
              <MultiSelectPill
                dropdownId="droppedReason"
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                values={droppedReason}
                placeholder="Select here"
                options={DROPPED_REASONS}
                onChange={setDroppedReason}
              />
            </div>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 flex w-full items-center gap-6 rounded-t-3xl px-5 py-3 shadow-[0_-4px_24px_-8px_rgba(31,23,80,0.12)]"
          style={{ backgroundColor: HEADER_BG }}
        >
          <div className="flex w-full justify-center">
            <button
              type="button"
              onClick={handleClear}
              className="w-full cursor-pointer rounded-3xl border-2 py-3 text-sm font-semibold"
              style={{ backgroundColor: "transparent", color: ACCENT, borderColor: ACCENT }}
            >
              Clear Filters
            </button>
          </div>
          <div className="flex w-full justify-center">
            <button
              type="button"
              onClick={onClose}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-3xl py-3 text-sm font-semibold"
              style={{ backgroundColor: ACCENT, color: "rgb(245, 245, 245)", borderColor: ACCENT }}
            >
              <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M21.03 5.72a.75.75 0 0 1 0 1.06l-11.5 11.5a.747.747 0 0 1-1.072-.012l-5.5-5.75a.75.75 0 1 1 1.084-1.036l4.97 5.195L19.97 5.72a.75.75 0 0 1 1.06 0Z" />
              </svg>
              Apply
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
