"use client";

import { BsPlus } from "react-icons/bs";

const ink = "rgb(31, 23, 80)";
const indigo = "rgb(52, 54, 156)";
const mutedBorder = "rgb(126, 122, 149)";

/** Horizontal project pills + assign — top of lead detail main column. */
export function LeadDetailProjectStrip({ projectName }: { projectName: string }) {
  return (
    <div className="flex w-full min-w-0 rounded-3xl py-1">
      <ul
        className="flex min-w-0 list-none gap-4 overflow-x-auto pb-0.5 [scrollbar-width:thin]"
        aria-label="Projects"
      >
        <li className="shrink-0">
          <div
            className="w-[12rem] max-w-[85vw] cursor-pointer rounded-2xl border-2 px-5 py-2"
            style={{
              backgroundColor: "rgba(248, 248, 248, 0.698)",
              borderColor: indigo,
            }}
          >
            <div
              className="truncate font-outfit text-base font-normal whitespace-nowrap"
              style={{ color: ink }}
              title={projectName}
            >
              {projectName}
            </div>
          </div>
        </li>
        <li className="shrink-0">
          <button
            type="button"
            className="flex min-w-[12rem] cursor-pointer items-center justify-center rounded-2xl border-2 px-[14px] py-2"
            style={{
              backgroundColor: "rgb(252, 253, 255)",
              borderColor: mutedBorder,
              color: ink,
            }}
          >
            <BsPlus className="mr-2 shrink-0" style={{ color: indigo }} size={23} aria-hidden />
            <span className="mt-[2px] font-outfit text-base font-normal whitespace-nowrap">Assign Project</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
