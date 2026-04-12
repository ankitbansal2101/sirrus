"use client";

import { LEAD_STAGE_OPTIONS, resolveStageForPills } from "@/lib/lead-stage-options";

type Props = {
  currentStage: string;
  onSelect: (stage: string) => void;
  /** Show the "Status" heading (hide when nested inside another titled section). */
  showHeading?: boolean;
  className?: string;
  /** Smaller pills for dense toolbars. */
  density?: "default" | "compact";
};

export function LeadStagePills({
  currentStage,
  onSelect,
  showHeading = true,
  className = "",
  density = "default",
}: Props) {
  const active = resolveStageForPills(currentStage);
  const compact = density === "compact";

  return (
    <div className={className}>
      {showHeading ? (
        <h3
          className={`font-outfit font-semibold tracking-tight text-[#1F1750] ${compact ? "mb-2 text-sm" : "mb-3 text-base"}`}
        >
          Status
        </h3>
      ) : null}
      <div
        className={`flex flex-wrap content-start overflow-x-auto pb-0.5 [scrollbar-width:thin] ${compact ? "gap-2 justify-start lg:justify-end" : "gap-2.5"}`}
        role="list"
      >
        {LEAD_STAGE_OPTIONS.map((opt) => {
          const selected = active === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="listitem"
              onClick={() => onSelect(opt.id)}
              className={`flex shrink-0 items-center rounded-full border font-outfit font-medium whitespace-nowrap transition-all hover:border-[#34369C]/35 hover:bg-[#f8f9ff] ${
                compact ? "gap-2 px-3.5 py-2 text-sm" : "gap-2.5 px-4 py-2.5 text-[15px] leading-tight"
              }`}
              style={{
                backgroundColor: selected ? "rgb(240, 241, 255)" : "rgb(255, 255, 255)",
                borderColor: selected ? "rgb(52, 54, 156)" : "rgb(226, 228, 236)",
                color: "rgb(31, 23, 80)",
                boxShadow: selected ? "0 1px 2px rgba(52, 54, 156, 0.12), 0 0 0 1px rgb(52, 54, 156)" : "0 1px 2px rgba(31, 23, 80, 0.04)",
              }}
              aria-pressed={selected}
              aria-label={`Set stage to ${opt.id}`}
            >
              <span
                className={`shrink-0 rounded-full ${compact ? "h-2.5 w-2.5" : "h-3 w-3"}`}
                style={{ backgroundColor: opt.dotColor }}
                aria-hidden
              />
              {opt.id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
