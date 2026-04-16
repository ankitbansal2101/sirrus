"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LeadRow } from "@/lib/leads-sample-data";

export type EditableFieldKind = "text" | "email" | "tel" | "select";

type Variant = "rail" | "stacked";

/** Left-rail grid column 3: keeps read-only and editable pencil icons aligned. */
export const RAIL_PENCIL_SLOT =
  "flex w-7 shrink-0 items-center justify-center self-start pt-0.5 sm:pt-1";

function emptyToDash(s: string) {
  const t = s.trim();
  return t === "" ? "-" : t;
}

export function EditableLeadSummaryField({
  label,
  lead,
  readOnly,
  kind,
  options,
  getDraftValue,
  buildPatch,
  renderDisplay,
  onPatchLead,
  variant = "rail",
}: {
  label: string;
  lead: LeadRow;
  readOnly?: boolean;
  kind: EditableFieldKind;
  options?: readonly string[];
  getDraftValue: (lead: LeadRow) => string;
  buildPatch: (draft: string, lead: LeadRow) => Partial<LeadRow>;
  renderDisplay: (lead: LeadRow) => ReactNode;
  onPatchLead?: (patch: Partial<LeadRow>) => void;
  variant?: Variant;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const canEdit = Boolean(onPatchLead) && !readOnly;

  const startEdit = useCallback(() => {
    if (!canEdit) return;
    setDraft(getDraftValue(lead));
    setEditing(true);
  }, [canEdit, getDraftValue, lead]);

  const commit = useCallback(() => {
    if (!onPatchLead) {
      setEditing(false);
      return;
    }
    onPatchLead(buildPatch(draft, lead));
    setEditing(false);
  }, [onPatchLead, buildPatch, draft, lead]);

  const cancel = useCallback(() => {
    setEditing(false);
  }, []);

  useEffect(() => {
    if (!editing) return;
    if (kind === "select") {
      selectRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [editing, kind]);

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        cancel();
      }
      if (e.key === "Enter" && kind !== "select") {
        e.preventDefault();
        e.stopPropagation();
        commit();
      }
    },
    [cancel, commit, kind],
  );

  const pencilBtn = (
    <button
      type="button"
      disabled={!canEdit}
      onClick={(e) => {
        e.stopPropagation();
        if (canEdit) startEdit();
      }}
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded p-0 ${canEdit ? "cursor-pointer hover:bg-slate-100/80" : "cursor-default opacity-40"}`}
      aria-label={canEdit ? `Edit ${label}` : undefined}
    >
      <Image src="/assets/images/editBluePencilIcon.svg" alt="" width={12} height={12} className="opacity-80" />
    </button>
  );

  const selectOpts = kind === "select" && options ? options : [];

  const editor =
    kind === "select" && selectOpts.length > 0 ? (
      <select
        ref={selectRef}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          onPatchLead?.(buildPatch(v, lead));
          setEditing(false);
        }}
        onKeyDown={onInputKeyDown}
        onBlur={() => setEditing(false)}
        className="w-full max-w-full rounded-lg border border-slate-200/90 bg-[#e8e9ea] py-2 pr-8 pl-3 font-outfit text-[13px] font-medium text-[#1F1750] outline-none focus:ring-2 focus:ring-[#34369C]/30"
      >
        {selectOpts.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "-" ? "—" : opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        ref={inputRef}
        type={kind === "email" ? "email" : "text"}
        inputMode={kind === "tel" ? "numeric" : undefined}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          if (kind === "tel") setDraft(v.replace(/\D/g, "").slice(0, 12));
          else setDraft(v);
        }}
        onBlur={commit}
        onKeyDown={onInputKeyDown}
        className="w-full max-w-full rounded-lg border border-slate-200/90 bg-[#e8e9ea] py-2 px-3 font-outfit text-[13px] font-medium text-[#1F1750] outline-none focus:ring-2 focus:ring-[#34369C]/30"
      />
    );

  if (variant === "stacked") {
    return (
      <div className="col-span-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium uppercase tracking-[0.6px]" style={{ color: "rgb(126, 122, 149)" }}>
              {label}
            </span>
            <div className="mt-2 min-w-0" style={{ color: "rgb(31, 23, 80)" }}>
              {editing ? editor : <div className="text-[15px] font-medium leading-normal">{renderDisplay(lead)}</div>}
            </div>
          </div>
          {!editing ? pencilBtn : <span className="w-7 shrink-0" aria-hidden />}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-200/50 px-3 py-3 last:border-b-0 sm:grid-cols-[minmax(6rem,34%)_1fr_auto] sm:items-start sm:gap-x-3 sm:gap-y-0">
      <span className="font-outfit text-[11px] font-semibold tracking-wide text-[#9c98b0] sm:pt-0.5">{label}</span>
      <div className="flex min-w-0 items-start justify-between gap-2 sm:contents">
        <div className="min-w-0 flex-1 font-outfit text-[13px] leading-relaxed font-medium text-[#1F1750] sm:min-w-0">
          {editing ? editor : renderDisplay(lead)}
        </div>
        {!editing ? (
          <span className={RAIL_PENCIL_SLOT}>{pencilBtn}</span>
        ) : (
          <span className={RAIL_PENCIL_SLOT} aria-hidden>
            <span className="block h-7 w-7 shrink-0" />
          </span>
        )}
      </div>
    </div>
  );
}

export { emptyToDash };
