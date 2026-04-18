"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MdLockOutline } from "react-icons/md";
import { LEAD_FORM_REQUIRED_ASTERISK_COLOR } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";

export type EditableFieldKind = "text" | "email" | "tel" | "select";

type Variant = "rail" | "stacked";

/** Left-rail grid column 3: legacy slot (stacked overview still uses per-field pencil). */
export const RAIL_PENCIL_SLOT =
  "flex w-7 shrink-0 items-center justify-center self-start pt-0.5 sm:pt-1";

function emptyToDash(s: string) {
  const t = s.trim();
  return t === "" ? "-" : t;
}

/** Lead form–style pill controls (inline rail bulk edit). */
const RAIL_FORM_SHELL =
  "flex w-full min-w-0 items-center rounded-full border-[1.5px] border-[#e4e5e6] bg-[#e4e5e6] py-1.5 pl-3 pr-2.5";
const RAIL_FORM_INPUT =
  "min-w-0 flex-1 border-0 bg-transparent font-outfit text-[13px] font-medium leading-snug text-[#1F1750] outline-none placeholder:text-[#b7b6ca]";
const RAIL_FORM_SELECT =
  "w-full min-w-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-[#e4e5e6] bg-[#e4e5e6] py-1.5 pl-3 pr-9 font-outfit text-[13px] font-medium leading-snug text-[#1F1750] outline-none focus:border-[#34369C]/45 focus:ring-1 focus:ring-[#34369C]/20";

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
  /** Left-rail bulk edit: `railBulkActive` shows editor; `registerRailBulkSaver` collects patches on Save. */
  railFieldKey,
  railBulkActive,
  registerRailBulkSaver,
  /** When rail bulk is on, Escape exits bulk mode (parent Cancel). */
  onExitRailBulk,
  labelRequired,
  /** Shown under the value column during rail bulk edit (e.g. WhatsApp validation). */
  railBulkInlineError,
  /** Rail read row: show lock beside masked WhatsApp / email. */
  railSensitiveReadLock,
  /** Rail bulk: WhatsApp / email stay masked until user taps unlock. */
  railBulkSensitiveNeedsUnlock,
  railBulkSensitiveUnlocked,
  onRailBulkSensitiveUnlock,
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
  railFieldKey?: string;
  railBulkActive?: boolean;
  registerRailBulkSaver?: (key: string, getPatch: () => Partial<LeadRow>) => () => void;
  onExitRailBulk?: () => void;
  labelRequired?: boolean;
  railBulkInlineError?: string;
  railSensitiveReadLock?: boolean;
  railBulkSensitiveNeedsUnlock?: boolean;
  railBulkSensitiveUnlocked?: boolean;
  onRailBulkSensitiveUnlock?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const canEdit = Boolean(onPatchLead) && !readOnly;
  const isRailBulk = variant === "rail" && Boolean(railBulkActive) && canEdit;
  const needsSensitiveUnlock = Boolean(railBulkSensitiveNeedsUnlock);
  const sensitiveUnlocked = Boolean(railBulkSensitiveUnlocked);
  const showRailLockedSensitive =
    variant === "rail" && isRailBulk && needsSensitiveUnlock && !sensitiveUnlocked;
  const showRailEditorInput = isRailBulk && !showRailLockedSensitive;

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

  // Bulk mode: seed draft only when entering bulk or switching leads. Do not depend on `lead` or
  // `getDraftValue` identity — parents pass inline `getDraftValue` every render, which would reset
  // `draft` after every keystroke/select change.
  useLayoutEffect(() => {
    if (!isRailBulk) return;
    if (needsSensitiveUnlock && !sensitiveUnlocked) return;
    setDraft(getDraftValue(lead));
  }, [isRailBulk, lead.id, needsSensitiveUnlock, sensitiveUnlocked]);

  useEffect(() => {
    if (!isRailBulk || !registerRailBulkSaver || !railFieldKey) return;
    return registerRailBulkSaver(railFieldKey, () => {
      if (needsSensitiveUnlock && !sensitiveUnlocked) return {};
      return buildPatch(draft, lead);
    });
  }, [
    isRailBulk,
    registerRailBulkSaver,
    railFieldKey,
    buildPatch,
    draft,
    lead,
    needsSensitiveUnlock,
    sensitiveUnlocked,
  ]);

  const editorVisible = variant === "stacked" ? editing : showRailEditorInput;

  useEffect(() => {
    if (!editorVisible || isRailBulk) return;
    if (kind === "select") {
      selectRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [editorVisible, isRailBulk, kind]);

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (isRailBulk) {
          onExitRailBulk?.();
          return;
        }
        cancel();
      }
      if (e.key === "Enter" && kind !== "select") {
        if (isRailBulk) return;
        e.preventDefault();
        e.stopPropagation();
        commit();
      }
    },
    [cancel, commit, kind, isRailBulk, onExitRailBulk],
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

  /** Stacked / per-field rail (legacy): bordered gray box. */
  const editorClassic =
    kind === "select" && selectOpts.length > 0 ? (
      <select
        ref={selectRef}
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          if (isRailBulk) return;
          onPatchLead?.(buildPatch(v, lead));
          setEditing(false);
        }}
        onKeyDown={onInputKeyDown}
        onBlur={() => {
          if (isRailBulk) return;
          setEditing(false);
        }}
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
        onBlur={() => {
          if (isRailBulk) return;
          commit();
        }}
        onKeyDown={onInputKeyDown}
        className="w-full max-w-full rounded-lg border border-slate-200/90 bg-[#e8e9ea] py-2 px-3 font-outfit text-[13px] font-medium text-[#1F1750] outline-none focus:ring-2 focus:ring-[#34369C]/30"
      />
    );

  /** Rail bulk: match lead form pill fields (#e4e5e6 fill, rounded-full). */
  const editorRailForm =
    kind === "select" && selectOpts.length > 0 ? (
      <div className="relative w-full min-w-0">
        <select
          ref={selectRef}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            setDraft(v);
          }}
          onKeyDown={onInputKeyDown}
          className={RAIL_FORM_SELECT}
        >
          {selectOpts.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "-" ? "—" : opt}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute top-1/2 right-2.5 z-[1] -translate-y-1/2 text-[#625C87]"
          aria-hidden
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
          </svg>
        </span>
      </div>
    ) : (
      <div className={RAIL_FORM_SHELL}>
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
          onKeyDown={onInputKeyDown}
          placeholder="Enter here"
          className={RAIL_FORM_INPUT}
        />
      </div>
    );

  const editor = isRailBulk ? editorRailForm : editorClassic;

  const railReadValue =
    variant === "rail" && railSensitiveReadLock && !isRailBulk ? (
      <div className="flex min-w-0 items-center gap-2">
        <div className="min-w-0 flex-1">{renderDisplay(lead)}</div>
        <MdLockOutline className="h-4 w-4 shrink-0 text-[#625C87]" aria-hidden title="Protected" />
      </div>
    ) : (
      renderDisplay(lead)
    );

  const railBulkLockedValue = (
    <>
      <div className="relative flex w-full min-w-0 items-center rounded-full border-[1.5px] border-[#e4e5e6] bg-[#e4e5e6] py-1.5 pl-3 pr-11">
        <div className="min-w-0 flex-1 font-outfit text-[13px] font-medium leading-snug text-[#1F1750] [&_a]:pointer-events-none [&_a]:no-underline">
          {renderDisplay(lead)}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRailBulkSensitiveUnlock?.();
          }}
          className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#34369C] transition-colors hover:bg-[#34369C]/12"
          aria-label={`Unlock to edit ${label}`}
          title="Unlock to edit"
        >
          <MdLockOutline className="h-[18px] w-[18px]" aria-hidden />
        </button>
      </div>
    </>
  );

  if (variant === "stacked") {
    return (
      <div className="col-span-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium uppercase tracking-[0.6px]" style={{ color: "rgb(126, 122, 149)" }}>
              {label}
              {labelRequired ? (
                <span style={{ color: LEAD_FORM_REQUIRED_ASTERISK_COLOR }}>
                  {" "}
                  *{" "}
                </span>
              ) : null}
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
    <div className="grid grid-cols-1 gap-1 border-b border-slate-200/50 px-3 py-2.5 last:border-b-0 sm:grid-cols-[minmax(6rem,34%)_1fr] sm:items-start sm:gap-x-3 sm:gap-y-0">
      <span
        className="font-outfit text-[11px] font-semibold tracking-wide sm:pt-1"
        style={{ color: "rgb(126, 122, 149)" }}
      >
        {label}
        {labelRequired ? (
          <span style={{ color: LEAD_FORM_REQUIRED_ASTERISK_COLOR }}>
            {" "}
            *{" "}
          </span>
        ) : null}
      </span>
      <div className="flex min-w-0 flex-col gap-1 font-outfit text-[13px] leading-relaxed font-medium text-[#1F1750]">
        {showRailLockedSensitive
          ? railBulkLockedValue
          : showRailEditorInput
            ? editor
            : railReadValue}
        {(showRailEditorInput || showRailLockedSensitive) && railBulkInlineError ? (
          <p
            role="alert"
            aria-live="polite"
            className="font-outfit text-[11px] font-medium leading-snug"
            style={{ color: LEAD_FORM_REQUIRED_ASTERISK_COLOR }}
          >
            {railBulkInlineError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export { emptyToDash };
