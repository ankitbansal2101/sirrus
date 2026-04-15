"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useCallback, useMemo, useState } from "react";
import { LeadTempBadge } from "@/lib/lead-temp-ring";
import {
  SAMPLE_LEADS,
  STAGE_TAB_COUNTS,
  stageBg,
  type LeadRow,
} from "@/lib/leads-sample-data";
import { AddLeadFormOverlay } from "./AddLeadFormOverlay";
import { LeadDetailDrawer } from "./LeadDetailDrawer";
import { LeadFiltersDrawer } from "./LeadFiltersDrawer";
import { IoCloudUpload } from "react-icons/io5";
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdCropSquare,
  MdKeyboardArrowDown,
  MdSearch,
  MdTune,
} from "react-icons/md";

function dashCell(value: string, ml?: number) {
  const isDash = value === "-";
  return (
    <div
      className="text-base"
      style={isDash && ml ? { marginLeft: ml, display: "inline-block" } : undefined}
    >
      {value}
    </div>
  );
}

function CommsPills() {
  return (
    <div className="flex flex-row flex-wrap items-center gap-3">
      <button
        type="button"
        className="relative flex h-9 w-fit cursor-pointer flex-row items-center gap-2 overflow-visible rounded-full border px-3"
        style={{
          backgroundColor: "rgb(229, 230, 241)",
          borderColor: "rgb(205, 205, 220)",
        }}
      >
        <Image src="/assets/images/whatsApp.svg" alt="chat" width={20} height={20} />
        <span className="text-xs font-medium" style={{ color: "rgb(31, 23, 80)" }}>
          Chat
        </span>
      </button>
      <button
        type="button"
        className="relative flex h-9 w-fit cursor-pointer flex-row items-center gap-2 overflow-visible rounded-full border px-3"
        style={{
          backgroundColor: "rgb(229, 230, 241)",
          borderColor: "rgb(205, 205, 220)",
        }}
      >
        <Image src="/assets/images/call.svg" alt="call" width={20} height={20} />
        <span className="text-xs font-medium" style={{ color: "rgb(31, 23, 80)" }}>
          Call
        </span>
      </button>
    </div>
  );
}

function AssignedPill({
  initials,
  title,
}: {
  initials: string;
  title?: string;
}) {
  return (
    <div className="relative w-28">
      <button
        type="button"
        title={title}
        className="flex h-7 min-w-28 w-full cursor-pointer items-center justify-between rounded-full border px-5 py-3 text-base font-medium outline-none"
        style={{ backgroundColor: "rgb(233, 234, 242)", opacity: 1 }}
      >
        <span className="whitespace-nowrap font-medium" style={{ color: "rgb(31, 23, 80)" }}>
          {initials}
        </span>
        <MdKeyboardArrowDown size={28} className="shrink-0 rotate-0 transition-transform" />
      </button>
    </div>
  );
}

export function ManageLeadsView() {
  const [activeTab, setActiveTab] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [leads, setLeads] = useState<LeadRow[]>(() => [...SAMPLE_LEADS]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [leadFormLead, setLeadFormLead] = useState<LeadRow | null>(null);
  const selectedLead = useMemo(
    () => (selectedId ? (leads.find((l) => l.id === selectedId) ?? null) : null),
    [leads, selectedId],
  );

  const handleStageChange = useCallback(
    (stage: string) => {
      if (!selectedId) return;
      setLeads((prev) => prev.map((l) => (l.id === selectedId ? { ...l, stage } : l)));
    },
    [selectedId],
  );

  const openEditLeadFormFromDrawer = useCallback(() => {
    if (!selectedLead) return;
    setLeadFormLead(selectedLead);
    setAddLeadOpen(true);
  }, [selectedLead]);

  const patchSelectedLead = useCallback(
    (patch: Partial<LeadRow>) => {
      if (!selectedId) return;
      setLeads((prev) => prev.map((l) => (l.id === selectedId ? { ...l, ...patch } : l)));
      setLeadFormLead((cur) => (cur && cur.id === selectedId ? { ...cur, ...patch } : cur));
    },
    [selectedId],
  );

  const total = 5400;
  const totalPages = Math.ceil(total / pageSize);

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <>
      <AddLeadFormOverlay
        key={`${addLeadOpen}-${leadFormLead?.id ?? "new"}`}
        open={addLeadOpen}
        lead={leadFormLead}
        onClose={() => {
          setAddLeadOpen(false);
          setLeadFormLead(null);
        }}
      />
      <LeadDetailDrawer
        key={selectedId ?? "closed"}
        lead={selectedLead}
        onClose={() => setSelectedId(null)}
        onStageChange={handleStageChange}
        onRequestEditLeadForm={openEditLeadFormFromDrawer}
        onPatchLead={patchSelectedLead}
      />
      <LeadFiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <div className="mt-2 flex items-center justify-between py-3">
        <div className="flex flex-row items-center">
          <span className="ml-4 self-center text-lg font-semibold" style={{ color: "rgb(52, 54, 156)" }}>
            Engagement Intelligence
          </span>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              type="button"
              className="flex !h-11 !w-[16.7rem] cursor-pointer items-center justify-between rounded-full border-2 border-none px-5 py-3 text-base font-medium opacity-100"
              style={{
                backgroundColor: "rgb(250, 250, 250)",
                borderColor: "rgb(228, 229, 230)",
              }}
            >
              <div className="flex max-w-[80%] flex-col">
                <span className="flex whitespace-nowrap font-medium" style={{ color: "rgb(31, 23, 80)" }}>
                  All Projects
                </span>
              </div>
              <MdKeyboardArrowDown size={24} className="shrink-0 rotate-0 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between py-1 pt-3">
        <div className="flex flex-row items-center" />
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            aria-disabled
            className="pointer-events-none flex cursor-pointer items-center justify-center rounded-3xl border-2 px-5 py-3 text-sm font-semibold opacity-50"
            style={{
              backgroundColor: "transparent",
              color: "rgb(52, 54, 156)",
              borderColor: "rgb(52, 54, 156)",
            }}
          >
            <span className="mr-2">
              <IoCloudUpload size={24} />
            </span>
            <p>Bulk Upload</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setLeadFormLead(null);
              setAddLeadOpen(true);
            }}
            className="flex cursor-pointer items-center justify-center rounded-3xl px-5 py-3 text-sm font-semibold opacity-100"
            style={{
              backgroundColor: "rgb(52, 54, 156)",
              color: "rgb(245, 245, 245)",
            }}
          >
            <span className="mr-2">
              <MdAdd size={24} strokeWidth={2} />
            </span>
            <p>Add Lead</p>
          </button>
        </div>
      </div>

      <div className="mt-3 w-full">
        <div
          className="overflow-hidden rounded-t-3xl"
          style={{
            background: "linear-gradient(90deg, rgb(233, 234, 255), rgb(226, 234, 255))",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            border: "1px solid rgb(193, 192, 203)",
            borderBottom: "none",
          }}
        >
          <div className="flex items-center overflow-x-auto custom-scrollbar pt-4 pl-6">
            <div className="w-full overflow-x-auto overflow-y-hidden pb-3 custom-scrollbar">
              <div className="flex min-w-max gap-x-2.5">
                {STAGE_TAB_COUNTS.map((tab, i) => {
                  const active = i === activeTab;
                  return (
                    <div key={tab.label} className="relative flex-shrink-0 cursor-pointer">
                      <button
                        type="button"
                        onClick={() => setActiveTab(i)}
                        className="mr-3 flex items-center justify-center gap-x-2.5 rounded-2xl px-5 py-3 text-sm last:mr-0 whitespace-nowrap"
                        style={{
                          backgroundColor: "rgb(255, 255, 255)",
                          color: "rgb(31, 23, 80)",
                          border: active ? "2px solid rgb(31, 23, 80)" : "1px solid rgb(193, 192, 203)",
                          boxShadow: active ? "rgba(107, 70, 255, 0.12) 0px 8px 20px" : undefined,
                          fontWeight: active ? 500 : 400,
                        }}
                      >
                        <span style={{ marginRight: 8 }}>{tab.label}</span>
                        <span
                          className="rounded-md px-2 py-1 text-[10px] font-semibold"
                          style={{
                            backgroundColor: active ? "rgba(31, 23, 80, 0.75)" : "rgb(221, 224, 242)",
                            color: active ? "rgb(243, 241, 251)" : "rgb(31, 23, 80)",
                            border: active ? "1px solid rgba(0, 0, 0, 0.06)" : "1px solid rgb(193, 192, 203)",
                          }}
                        >
                          {tab.count}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center px-3 py-3" style={{ background: "rgb(250, 250, 250)" }}>
            <div
              className="flex !w-[63%] items-center rounded-3xl border-2 bg-transparent h-11"
              style={{ borderColor: "rgb(194, 188, 228)" }}
            >
              <div className="pl-4">
                <MdSearch size={22} style={{ color: "#625C87" }} />
              </div>
              <div className="w-full">
                <div className="relative flex w-full flex-col">
                  <div
                    className="flex w-full items-center overflow-hidden rounded-full border-[1.5px] py-2.5 pr-2.5 pl-5"
                    style={{ border: "none", opacity: 1 }}
                  >
                    <input
                      id="search"
                      autoComplete="off"
                      placeholder="Search lead by name or number or ID"
                      className="custom-placeholder no-spinner w-full border-none bg-transparent text-base font-medium outline-none"
                      style={{ color: "rgb(31, 23, 80)" }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row">
              {[
                { icon: "/assets/images/Hot.svg", label: "Hot", count: 150 },
                { icon: "/assets/images/Warm.svg", label: "Warm", count: 823 },
                { icon: "/assets/images/Cold.svg", label: "Cold", count: 92 },
              ].map((f) => (
                <div
                  key={f.label}
                  className="ml-4 flex min-h-[2.75rem] w-max flex-shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-full border px-5 py-2.5"
                  style={{ borderColor: "rgb(194, 188, 228)", backgroundColor: "transparent" }}
                >
                  <Image className="mr-1" src={f.icon} alt={f.label} width={25} height={25} />
                  <span className="flex items-center text-base font-medium" style={{ color: "rgb(31, 23, 80)" }}>
                    {f.label}
                    <span className="ml-1 text-xs">({f.count})</span>
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="ml-4 flex h-[2.75rem] w-[6.875rem] cursor-pointer flex-row items-center gap-2 rounded-full border px-5 py-2.5"
              style={{ borderColor: "rgb(194, 188, 228)" }}
            >
              <Image src="/assets/images/FilterIcon.svg" alt="" width={20} height={20} />
              <span className="text-center text-base font-medium" style={{ color: "rgb(31, 23, 80)" }}>
                Filter
              </span>
            </button>
          </div>
        </div>

        <div
          className="mt-0 overflow-hidden rounded-b-3xl"
          style={{
            border: "1px solid rgb(193, 192, 203)",
            borderTop: "none",
            background: "rgb(255, 255, 255)",
          }}
        >
          <div className="relative">
            <div className="custom-scrollbar relative isolate z-0 w-full overflow-x-auto">
              <table
                className="table-fixed border-separate"
                style={{ borderSpacing: 0, width: "max-content", minWidth: "100%" }}
              >
                <thead
                  className="sticky top-0 z-0"
                  style={{ backgroundColor: "rgb(252, 253, 255)" }}
                >
                  <tr className="border-b" style={{ borderBottom: "1px solid rgb(212, 211, 223)" }}>
                    <th
                      className="sticky left-0 z-[3] px-3 py-5 text-left text-base font-semibold whitespace-nowrap"
                      style={{
                        color: "rgb(126, 122, 149)",
                        borderBottom: "1px solid rgb(212, 211, 223)",
                        minWidth: 56,
                        width: 56,
                        maxWidth: 56,
                        backgroundColor: "rgb(252, 253, 255)",
                      }}
                    >
                      <MdCropSquare size={24} style={{ color: "rgb(219, 219, 232)", cursor: "not-allowed" }} />
                    </th>
                    <th
                      className="sticky z-[3] px-3 py-5 text-left text-base font-semibold whitespace-nowrap"
                      style={{
                        left: 56,
                        color: "rgb(126, 122, 149)",
                        borderBottom: "1px solid rgb(212, 211, 223)",
                        minWidth: 220,
                        width: 220,
                        backgroundColor: "rgb(252, 253, 255)",
                      }}
                    >
                      LEAD NAMES
                    </th>
                    <th
                      className="sticky z-[3] px-3 py-5 text-left text-base font-semibold whitespace-nowrap"
                      style={{
                        left: 276,
                        color: "rgb(126, 122, 149)",
                        borderBottom: "1px solid rgb(212, 211, 223)",
                        minWidth: 150,
                        width: 150,
                        backgroundColor: "rgb(252, 253, 255)",
                      }}
                    >
                      LEAD ID
                    </th>
                    <th
                      className="sticky z-[3] px-3 py-5 text-left text-base font-semibold whitespace-nowrap"
                      style={{
                        left: 426,
                        color: "rgb(126, 122, 149)",
                        borderBottom: "1px solid rgb(212, 211, 223)",
                        minWidth: 270,
                        width: 270,
                        borderRight: "1px solid rgb(212, 211, 223)",
                        backgroundColor: "rgb(252, 253, 255)",
                      }}
                    >
                      COMMUNICATIONS
                    </th>
                    {[
                      "STAGE",
                      "SOURCE",
                      "SUB SOURCE",
                      "PROJECT",
                      "LUD",
                      "ASSIGNED",
                      "Create Date",
                      "Whatsapp Number",
                      "Alternate Number",
                      "Email Id",
                      "Preferred Unit Type",
                      "Max Budget",
                      "Property Status",
                      "Purpose",
                      "Other Preferences",
                      "Occupation",
                      "Qualification",
                      "Funding Source",
                      "Budget Range",
                      "Preferred Location",
                      "Age",
                      "Gender",
                      "Company Name",
                      "State",
                      "City",
                      "Region",
                      "Designation",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-5 text-left text-base font-semibold whitespace-nowrap"
                        style={{
                          color: "rgb(126, 122, 149)",
                          borderBottom: "1px solid rgb(212, 211, 223)",
                        }}
                      >
                        <div className="flex items-center">{h}</div>
                      </th>
                    ))}
                    <th
                      className="sticky right-0 z-30 px-3 py-4 text-right"
                      style={{
                        width: 56,
                        minWidth: 56,
                        maxWidth: 56,
                        backgroundColor: "rgb(252, 253, 255)",
                        borderBottom: "1px solid rgb(212, 211, 223)",
                      }}
                    >
                      <button
                        id="customize-view-config-trigger"
                        type="button"
                        title="Customize columns"
                        aria-label="Customize columns"
                        className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: "rgb(238, 241, 255)",
                          color: "rgb(52, 54, 156)",
                          border: "1px solid rgb(205, 205, 220)",
                        }}
                      >
                        <MdTune size={18} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((row) => (
                    <LeadTableRow key={row.id} row={row} onOpenLead={() => setSelectedId(row.id)} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-4">
              <div className="relative inline-block">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="cursor-pointer appearance-none rounded-3xl border-2 bg-transparent py-3 pr-8 pl-4 outline-none"
                  style={{
                    color: "rgb(126, 122, 149)",
                    backgroundColor: "rgb(250, 250, 250)",
                    borderWidth: 2,
                  }}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform">
                  <MdKeyboardArrowDown size={20} style={{ color: "#7E7A95" }} />
                </div>
              </div>
              <div className="ml-2" style={{ color: "rgb(126, 122, 149)" }}>
                Showing {start} - {end} of {total}
              </div>
            </div>
            <PaginationControls page={page} totalPages={totalPages} onPage={setPage} />
          </div>
        </div>
      </div>
    </>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", totalPages);
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="mx-1 rounded-full px-1 py-1 disabled:opacity-50"
        style={{ background: page <= 1 ? "rgb(232, 231, 238)" : "rgba(118, 121, 255, 0.3)" }}
      >
        <MdChevronLeft size={22} style={{ color: page <= 1 ? "rgb(152, 149, 171)" : "#34369c" }} />
      </button>
      {pages.map((p, idx) =>
        p === "..." ? (
          <button
            key={`e-${idx}`}
            type="button"
            disabled
            className="mx-1 rounded-full px-3 py-1"
            style={{ background: "transparent", color: "rgb(126, 122, 149)" }}
          >
            ...
          </button>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className="mx-1 rounded-full px-3 py-1"
            style={{
              background: p === page ? "rgb(52, 54, 156)" : "transparent",
              color: p === page ? "rgb(245, 245, 245)" : "rgb(126, 122, 149)",
            }}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="mx-1 rounded-full px-1 py-1 disabled:opacity-50"
        style={{
          background: page >= totalPages ? "transparent" : "rgba(118, 121, 255, 0.3)",
          borderRadius: "50%",
        }}
      >
        <MdChevronRight
          size={22}
          style={{
            color: page >= totalPages ? "rgb(152, 149, 171)" : "rgb(52, 54, 156)",
          }}
        />
      </button>
    </div>
  );
}

function stickyCellBase(extra?: CSSProperties): CSSProperties {
  return {
    height: 62,
    color: "rgb(31, 23, 80)",
    borderBottom: "1px solid rgb(212, 211, 223)",
    backgroundColor: "rgb(252, 253, 255)",
    ...extra,
  };
}

function LeadTableRow({ row, onOpenLead }: { row: LeadRow; onOpenLead: () => void }) {
  const mlMap: Record<string, number> = {
    altNumber: 42,
    preferredUnit: 25,
    email: 42,
    maxBudget: 15,
    propertyStatus: 40,
    purpose: 20,
    otherPrefs: 25,
    occupation: 25,
    qualification: 35,
    funding: 35,
    budgetRange: 30,
    preferredLocation: 42,
    age: 10,
    gender: 15,
    company: 35,
    state: 15,
    city: 10,
    region: 15,
    designation: 30,
  };

  const textFields: (keyof LeadRow)[] = [
    "whatsapp",
    "altNumber",
    "email",
    "preferredUnit",
    "maxBudget",
    "propertyStatus",
    "purpose",
    "otherPrefs",
    "occupation",
    "qualification",
    "funding",
    "budgetRange",
    "preferredLocation",
    "age",
    "gender",
    "company",
    "state",
    "city",
    "region",
    "designation",
  ];

  return (
    <tr className="border-b" style={{ borderColor: "rgb(194, 188, 228)" }}>
      <td
        className="sticky left-0 z-[2] px-3 py-2.5 text-left whitespace-nowrap"
        style={stickyCellBase({ minWidth: 56, width: 56, maxWidth: 56, left: 0 })}
      >
        <div className="flex h-full items-center">
          <MdCropSquare size={24} style={{ color: "rgb(219, 219, 232)", cursor: "not-allowed" }} />
        </div>
      </td>
      <td
        className="sticky z-[2] cursor-pointer px-3 py-2.5 text-left whitespace-nowrap"
        style={stickyCellBase({ minWidth: 220, width: 220, left: 56 })}
      >
        <button
          type="button"
          className="flex h-full w-full cursor-pointer items-center text-left"
          onClick={onOpenLead}
        >
          <div className="flex items-center gap-2" style={{ color: "rgb(194, 188, 228)" }}>
            <LeadTempBadge temp={row.temp} />
            <div
              className="max-w-[9.375rem] truncate overflow-hidden text-base whitespace-nowrap"
              style={{ color: "rgb(31, 23, 80)" }}
              title={row.name}
            >
              {row.name}
            </div>
          </div>
        </button>
      </td>
      <td
        className="sticky z-[2] cursor-pointer px-3 py-2.5 text-left whitespace-nowrap"
        style={stickyCellBase({ minWidth: 150, width: 150, left: 276 })}
      >
        <button type="button" className="flex h-full w-full cursor-pointer items-center text-left" onClick={onOpenLead}>
          <div className="text-base">{row.leadId}</div>
        </button>
      </td>
      <td
        className="sticky z-[2] px-3 py-2.5 text-left whitespace-nowrap"
        style={stickyCellBase({
          minWidth: 270,
          width: 270,
          left: 426,
          borderRight: "1px solid rgb(212, 211, 223)",
        })}
      >
        <div className="flex h-full items-center overflow-visible">
          <CommsPills />
        </div>
      </td>
      <td className="!w-[155px] px-3 py-2.5 text-left whitespace-nowrap" style={stickyCellBase()}>
        <div className="flex h-full items-center">
          <div
            className="flex min-w-32 w-full cursor-pointer items-center justify-center rounded-md px-2 py-1 text-center text-base"
            style={{ color: "rgb(31, 23, 80)", backgroundColor: stageBg(row.stage) }}
          >
            {row.stage}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-left whitespace-nowrap" style={stickyCellBase()}>
        <div className="flex h-full items-center">
          <div className="text-base" style={{ color: "rgb(31, 23, 80)" }}>
            {row.source}
          </div>
        </div>
      </td>
      <td className="!w-[12rem] px-3 py-2.5 text-left whitespace-nowrap" style={stickyCellBase()}>
        <div className="flex h-full items-center">
          <div
            className="truncate text-base"
            style={{ color: "rgb(31, 23, 80)" }}
            title={row.subSource.length > 20 ? row.subSource : undefined}
          >
            {row.subSource.length > 22 ? `${row.subSource.slice(0, 19)}...` : row.subSource}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-left whitespace-nowrap" style={stickyCellBase()}>
        <div className="flex h-full items-center">
          <div
            className="h-[1.625rem] w-[11.187rem] cursor-pointer overflow-hidden rounded-lg px-2 py-1"
            style={{ backgroundColor: "rgb(233, 234, 242)" }}
          >
            <div className="truncate text-sm whitespace-nowrap" style={{ color: "rgb(31, 23, 80)" }}>
              {row.project}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-left whitespace-nowrap" style={stickyCellBase()}>
        <div className="flex h-full items-center">
          <div className="text-base" style={{ color: "rgb(31, 23, 80)" }}>
            {row.lud}
          </div>
        </div>
      </td>
      <td className="!w-[8rem] px-3 py-2.5 text-left whitespace-nowrap" style={stickyCellBase()}>
        <div className="flex h-full w-28 items-center">
          <AssignedPill initials={row.assignedInitials} title={row.assignedTitle} />
        </div>
      </td>
      <td className="px-3 py-2.5 text-left whitespace-nowrap" style={stickyCellBase()}>
        <div className="flex h-full items-center">
          <div className="text-base">{row.createDate}</div>
        </div>
      </td>
      {textFields.map((k) => (
        <td key={k} className="px-3 py-2.5 text-left whitespace-nowrap" style={stickyCellBase()}>
          <div className="flex h-full items-center">
            {dashCell(String(row[k]), mlMap[k])}
          </div>
        </td>
      ))}
      <td
        className="sticky right-0 z-20 px-0 py-0"
        style={{
          width: 56,
          minWidth: 56,
          maxWidth: 56,
          backgroundColor: "rgb(252, 253, 255)",
          borderBottom: "1px solid rgb(212, 211, 223)",
        }}
      />
    </tr>
  );
}
