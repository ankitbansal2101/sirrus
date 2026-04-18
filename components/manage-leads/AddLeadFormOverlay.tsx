"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IoChevronBack } from "react-icons/io5";
import { MdCalendarToday, MdCheck, MdKeyboardArrowDown, MdLockOutline } from "react-icons/md";
import { buildLeadFormState, type LeadFormState } from "@/lib/lead-form-defaults";
import { maskEmailSensitive, maskWhatsappSensitive } from "@/lib/lead-overview-model";
import { LEAD_FORM_REQUIRED_ASTERISK_COLOR } from "@/lib/left-rail-field-registry";
import type { LeadRow } from "@/lib/leads-sample-data";
import { useClientMounted } from "@/lib/use-client-mounted";

const headerBg = "rgba(248, 248, 248, 0.698)";
const panelBg = "rgba(248, 248, 248, 0.698)";
const inputBg = "rgb(228, 229, 230)";
const inputBorder = "rgb(228, 229, 230)";
const labelMuted = "rgb(126, 122, 149)";
const ink = "rgb(31, 23, 80)";
const placeholderMuted = "rgb(188, 188, 188)";
const indigo = "rgb(52, 54, 156)";
const backBtnBg = "rgb(216, 216, 216)";
const backIcon = "rgb(71, 84, 103)";

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="mb-7 text-lg font-semibold" style={{ color: ink }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <h3 className="mx-5 mb-2 text-base font-medium" style={{ color: labelMuted }}>
      {children}
      {required ? (
        <span style={{ color: LEAD_FORM_REQUIRED_ASTERISK_COLOR }}>
          {" "}
          *{" "}
        </span>
      ) : null}
    </h3>
  );
}

function RoundedInput({
  id,
  value,
  onChange,
  placeholder = "Enter here",
  maxLength,
  type = "text",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
}) {
  return (
    <div
      className="flex w-full items-center overflow-hidden rounded-full border-[1.5px] py-2.5 pr-2.5 pl-5"
      style={{ backgroundColor: inputBg, borderColor: inputBorder }}
    >
      <input
        id={id}
        type={type}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        className="w-full border-none bg-transparent text-base font-medium outline-none placeholder:text-[#BCBCBC]"
        style={{ color: ink, fontSize: 16 }}
      />
    </div>
  );
}

function RoundedTextarea({
  id,
  value,
  onChange,
  placeholder = "Enter here",
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div
      className="flex w-full overflow-hidden rounded-2xl border-[1.5px] py-2.5 pr-2.5 pl-5"
      style={{ backgroundColor: inputBg, borderColor: inputBorder }}
    >
      <textarea
        id={id}
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full resize-none border-none bg-transparent text-base font-medium outline-none placeholder:text-[#BCBCBC]"
        style={{ color: ink, fontSize: 16 }}
      />
    </div>
  );
}

function SelectField({
  value,
  disabled,
  border2,
}: {
  value: string;
  disabled?: boolean;
  border2?: boolean;
}) {
  const has = value.trim().length > 0;
  const display = has ? value.trim() : "Select here";
  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex w-full items-center justify-between rounded-full px-5 py-3 text-base font-medium ${
        border2 ? "border-2 pr-4" : "border min-w-28"
      } ${disabled && !has ? "cursor-not-allowed opacity-50" : disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      style={{
        backgroundColor: inputBg,
        borderColor: inputBorder,
        outline: "none",
        opacity: disabled && !has ? 0.5 : 1,
      }}
    >
      <span className="truncate font-medium" style={{ color: has ? ink : placeholderMuted }}>
        {display}
      </span>
      <MdKeyboardArrowDown size={border2 ? 24 : 28} className="shrink-0" style={{ color: ink }} />
    </button>
  );
}

function PhonePrefixInput({
  id,
  value,
  onChange,
  maxLength,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
}) {
  return (
    <div
      className="flex w-full items-center rounded-full border-[1.5px] py-2.5 pr-2.5 pl-5"
      style={{ backgroundColor: inputBg, borderColor: inputBorder }}
    >
      <div className="flex items-center">
        <button
          type="button"
          className="flex h-8 min-w-28 cursor-pointer items-center justify-between rounded-full border bg-transparent px-3 text-base font-medium"
          style={{ backgroundColor: "rgb(233, 234, 242)", color: ink }}
        >
          <span>(+91)</span>
          <MdKeyboardArrowDown size={22} />
        </button>
        <div className="mx-2 h-5 w-px shrink-0" style={{ backgroundColor: "rgb(199, 197, 211)" }} />
      </div>
      <input
        id={id}
        type="text"
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, maxLength))}
        placeholder="Enter here"
        className="min-w-0 flex-1 border-none bg-transparent text-base font-medium outline-none placeholder:text-[#BCBCBC]"
        style={{ color: ink, fontSize: 16 }}
      />
    </div>
  );
}

/** Edit lead: masked WhatsApp with (+91) shell until user unlocks. */
function EditLockedPhoneRow({ maskedDisplay, onUnlock }: { maskedDisplay: string; onUnlock: () => void }) {
  return (
    <div
      className="relative flex w-full items-center rounded-full border-[1.5px] py-2.5 pr-12 pl-5"
      style={{ backgroundColor: inputBg, borderColor: inputBorder }}
    >
      <div className="pointer-events-none flex shrink-0 items-center opacity-90">
        <div
          className="flex h-8 min-w-28 items-center justify-between rounded-full border bg-transparent px-3 text-base font-medium"
          style={{ backgroundColor: "rgb(233, 234, 242)", color: ink }}
        >
          <span>(+91)</span>
          <MdKeyboardArrowDown size={22} aria-hidden />
        </div>
        <div className="mx-2 h-5 w-px shrink-0" style={{ backgroundColor: "rgb(199, 197, 211)" }} />
      </div>
      <span className="min-w-0 flex-1 truncate text-base font-medium" style={{ color: ink, fontSize: 16 }}>
        {maskedDisplay || "—"}
      </span>
      <button
        type="button"
        onClick={onUnlock}
        className="absolute top-1/2 right-2.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#34369C] transition-colors hover:bg-[#34369C]/10"
        aria-label="Unlock to view and edit WhatsApp number"
        title="Unlock to edit"
      >
        <MdLockOutline size={22} aria-hidden />
      </button>
    </div>
  );
}

/** Edit lead: masked email until user unlocks. */
function EditLockedEmailRow({ maskedDisplay, onUnlock }: { maskedDisplay: string; onUnlock: () => void }) {
  return (
    <div
      className="relative flex w-full items-center overflow-hidden rounded-full border-[1.5px] py-2.5 pr-12 pl-5"
      style={{ backgroundColor: inputBg, borderColor: inputBorder }}
    >
      <span className="min-w-0 flex-1 truncate text-base font-medium" style={{ color: ink, fontSize: 16 }}>
        {maskedDisplay === "-" ? "" : maskedDisplay}
      </span>
      <button
        type="button"
        onClick={onUnlock}
        className="absolute top-1/2 right-2.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[#34369C] transition-colors hover:bg-[#34369C]/10"
        aria-label="Unlock to view and edit email"
        title="Unlock to edit"
      >
        <MdLockOutline size={22} aria-hidden />
      </button>
    </div>
  );
}

function PillToggle({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mx-5 flex flex-wrap gap-2">
      {options.map((opt) => {
        const on = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="rounded-full border-2 px-4 py-2.5 text-sm font-medium transition-colors"
            style={{
              borderColor: indigo,
              color: indigo,
              backgroundColor: on ? "rgba(52, 54, 156, 0.08)" : "transparent",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function DateFieldButton({ label, value }: { label: string; value: string }) {
  const has = value.trim().length > 0;
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between rounded-full border-2 px-5 py-2.5 text-base font-normal"
        style={{
          backgroundColor: inputBg,
          borderColor: inputBorder,
          color: has ? ink : "rgb(183, 182, 202)",
        }}
      >
        <span className="truncate">{has ? value : "Select here"}</span>
        <MdCalendarToday size={22} className="shrink-0 text-[#64748b]" aria-hidden />
      </button>
    </div>
  );
}

export function AddLeadFormOverlay({
  open,
  onClose,
  lead = null,
}: {
  open: boolean;
  onClose: () => void;
  /** When set, form opens in edit mode prepopulated from this lead. */
  lead?: LeadRow | null;
}) {
  const mounted = useClientMounted();
  const [form, setForm] = useState<LeadFormState>(() => buildLeadFormState(lead ?? null));
  const [sheetEntered, setSheetEntered] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  const [whatsappUnlocked, setWhatsappUnlocked] = useState(false);
  const [emailUnlocked, setEmailUnlocked] = useState(false);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setSheetEntered(false);
  }

  const patch = useCallback(<K extends keyof LeadFormState>(key: K, value: LeadFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  }, []);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", handleKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prev;
    };
  }, [open, handleKey]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSheetEntered(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const leadKey = lead?.id ?? "";
  useEffect(() => {
    if (!open) return;
    setForm(buildLeadFormState(lead ?? null));
    setWhatsappUnlocked(false);
    setEmailUnlocked(false);
  }, [open, leadKey]);

  const isEdit = Boolean(lead);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[102] flex justify-end">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close form"
        className="absolute inset-0 cursor-pointer border-0 bg-[#1F1750]/22 backdrop-blur-[6px] transition-opacity"
      />
      <div
        className={`relative z-10 flex h-full max-h-[100dvh] w-full max-w-[min(100vw,580px)] flex-col bg-white shadow-[-16px_0_48px_-12px_rgba(31,23,80,0.2)] transition-transform duration-300 ease-out ${
          sheetEntered ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-lead-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/70 py-4 pr-5 pl-5" style={{ backgroundColor: headerBg }}>
          <div className="flex items-center">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: backBtnBg }}
            >
              <IoChevronBack size={18} style={{ color: backIcon }} />
            </button>
            <h1 id="add-lead-form-title" className="ml-5 text-xl font-semibold" style={{ color: ink }}>
              {isEdit ? "Edit Lead Form" : "Lead Form"}
            </h1>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pt-5">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl" style={{ backgroundColor: panelBg }}>
            <div
              id="scrollableArea"
              className="min-h-0 flex-1 overflow-y-auto p-5 [scrollbar-width:thin]"
            >
            <FormSection title="Lead Info">
              <div className="grid grid-cols-1 gap-x-10 gap-y-0 md:grid-cols-2">
                <div className="mb-7 min-w-0">
                  <FieldLabel required>Full Name</FieldLabel>
                  <RoundedInput
                    id="fullName"
                    maxLength={50}
                    value={form.fullName}
                    onChange={(v) => patch("fullName", v)}
                  />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel required>Project Name</FieldLabel>
                  <SelectField border2 value={form.projectName} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel required>Source</FieldLabel>
                  <SelectField value={form.source} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel required>Sub Source</FieldLabel>
                  <SelectField disabled value={form.subSource} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel required>WhatsApp Number</FieldLabel>
                  {isEdit && lead && !whatsappUnlocked ? (
                    <EditLockedPhoneRow
                      maskedDisplay={maskWhatsappSensitive(lead.whatsapp)}
                      onUnlock={() => setWhatsappUnlocked(true)}
                    />
                  ) : (
                    <PhonePrefixInput
                      id="whatsAppNumber"
                      maxLength={10}
                      value={form.whatsappDigits}
                      onChange={(v) => patch("whatsappDigits", v)}
                    />
                  )}
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Alternate Number</FieldLabel>
                  <PhonePrefixInput
                    id="alternateNumber"
                    maxLength={10}
                    value={form.alternateDigits}
                    onChange={(v) => patch("alternateDigits", v)}
                  />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Email ID</FieldLabel>
                  {isEdit && lead && !emailUnlocked ? (
                    <EditLockedEmailRow
                      maskedDisplay={maskEmailSensitive(lead.email)}
                      onUnlock={() => setEmailUnlocked(true)}
                    />
                  ) : (
                    <RoundedInput id="email" type="email" value={form.email} onChange={(v) => patch("email", v)} />
                  )}
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Assigned To</FieldLabel>
                  <SelectField disabled value={form.assignedTo} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>new field AB</FieldLabel>
                  <RoundedInput
                    id="newFieldAb"
                    maxLength={25}
                    value={form.newFieldAb}
                    onChange={(v) => patch("newFieldAb", v)}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Preferences">
              <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
                <div className="mb-7 min-w-0">
                  <FieldLabel>Preferred Unit Type</FieldLabel>
                  <SelectField border2 disabled value={form.preferredUnit} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Max Budget</FieldLabel>
                  <RoundedInput
                    id="budgetRange"
                    maxLength={9}
                    value={form.maxBudget}
                    onChange={(v) => patch("maxBudget", v)}
                  />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Property Status</FieldLabel>
                  <SelectField border2 disabled value={form.propertyStatus} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Other Preferences</FieldLabel>
                  <RoundedTextarea
                    id="otherPreferences"
                    value={form.otherPreferences}
                    onChange={(v) => patch("otherPreferences", v)}
                  />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Purpose</FieldLabel>
                  <PillToggle
                    options={["Investment", "Personal Use"]}
                    value={form.purpose}
                    onChange={(v) => patch("purpose", v as LeadFormState["purpose"])}
                  />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Preferred Location</FieldLabel>
                  <RoundedInput
                    id="preferredLocation"
                    maxLength={25}
                    value={form.preferredLocation}
                    onChange={(v) => patch("preferredLocation", v)}
                  />
                </div>
              </div>
            </FormSection>

            <FormSection title="Profile">
              <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2">
                <div className="mb-7 min-w-0">
                  <FieldLabel>Age</FieldLabel>
                  <RoundedInput id="age" maxLength={25} value={form.age} onChange={(v) => patch("age", v)} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Gender</FieldLabel>
                  <SelectField border2 value={form.gender} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Occupation</FieldLabel>
                  <SelectField border2 value={form.occupation} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Qualification</FieldLabel>
                  <SelectField border2 value={form.qualification} />
                </div>
                <div className="mb-7 min-w-0">
                  <FieldLabel>Funding Source</FieldLabel>
                  <PillToggle
                    options={["Loan", "Self funded"]}
                    value={form.funding}
                    onChange={(v) => patch("funding", v as LeadFormState["funding"])}
                  />
                </div>
                <div className="mb-7 min-w-0">
                  <DateFieldButton label="Booking Date" value={form.bookingDate} />
                </div>
                <div className="mb-7 min-w-0">
                  <DateFieldButton label="Date of Anniversary" value={form.anniversaryDate} />
                </div>
              </div>
            </FormSection>
          </div>
        </div>
        </div>

        <div
          className="flex shrink-0 items-center gap-4 border-t border-slate-200/80 px-5 py-4"
          style={{ backgroundColor: headerBg }}
        >
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 flex-1 cursor-pointer rounded-3xl border-2 py-3 text-sm font-semibold"
            style={{ backgroundColor: "transparent", color: indigo, borderColor: indigo }}
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-3xl py-3 text-sm font-semibold"
            style={{ backgroundColor: indigo, color: "rgb(245, 245, 245)", borderColor: indigo }}
          >
            <MdCheck className="mr-2 shrink-0" size={22} aria-hidden />
            SAVE
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
