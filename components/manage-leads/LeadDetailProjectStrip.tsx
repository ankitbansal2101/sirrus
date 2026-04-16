"use client";

import { BsPlus } from "react-icons/bs";

const ink = "rgb(31, 23, 80)";
const indigo = "rgb(52, 54, 156)";
const mutedBorder = "rgb(126, 122, 149)";

/** Horizontal project pills + assign — top of lead detail main column. */
export function LeadDetailProjectStrip({ projectName }: { projectName: string }) {
  return (
    <div className="flex w-full min-w-0 py-0">
      <ul
        className="flex min-w-0 list-none gap-2 overflow-x-auto pb-0.5 [scrollbar-width:thin] sm:gap-2.5"
        aria-label="Projects"
      >
        <li className="shrink-0">
          <div
            className="max-w-[min(10.5rem,72vw)] cursor-pointer rounded-xl border px-3 py-1.5 sm:max-w-[12rem] sm:px-3.5 sm:py-1.5"
            style={{
              backgroundColor: "rgba(248, 248, 248, 0.698)",
              borderColor: indigo,
              borderWidth: 1.5,
            }}
          >
            <div
              className="truncate font-outfit text-sm font-medium whitespace-nowrap sm:text-[15px]"
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
            className="flex cursor-pointer items-center justify-center gap-1 rounded-xl border px-3 py-1.5 sm:px-3.5 sm:py-1.5"
            style={{
              backgroundColor: "rgb(252, 253, 255)",
              borderColor: mutedBorder,
              borderWidth: 1.5,
              color: ink,
            }}
          >
            <BsPlus className="shrink-0" style={{ color: indigo }} size={18} aria-hidden />
            <span className="font-outfit text-sm font-medium whitespace-nowrap sm:text-[15px]">Assign Project</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
