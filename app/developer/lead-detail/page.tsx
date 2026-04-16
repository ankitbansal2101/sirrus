"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { LeadDetailPagePreview } from "@/components/developer/LeadDetailPagePreview";
import { useLeftRailFieldConfigV2 } from "@/components/manage-leads/useLeftRailFieldConfig";
import { SAMPLE_LEADS, type LeadRow } from "@/lib/leads-sample-data";

function pickPreviewLead(): LeadRow {
  const row = SAMPLE_LEADS.find((l) => l.id === "4" || l.leadId === "L0226000001");
  return row ? { ...row } : { ...SAMPLE_LEADS[0] };
}

export default function DeveloperLeadDetailPage() {
  const { orderedVisibleIds } = useLeftRailFieldConfigV2();
  const [lead, setLead] = useState<LeadRow>(pickPreviewLead);

  const onLeadPatch = useCallback((patch: Partial<LeadRow>) => {
    setLead((prev) => ({ ...prev, ...patch }));
  }, []);

  const onStageChange = useCallback((stage: string) => {
    setLead((prev) => ({ ...prev, stage }));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[min(100%,1920px)] flex-col gap-3 pb-6 pt-1">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-outfit text-lg font-semibold tracking-tight text-[#1F1750]">Lead detail preview (V2)</h1>
          <p className="mt-1 max-w-2xl font-outfit text-xs leading-snug text-[#8b87a8]">
            Full-page preview using the left-rail field list from{" "}
            <Link href="/developer/widgets-config-v2" className="font-semibold text-[#34369C] underline-offset-2 hover:underline">
              Widgets configurator V2
            </Link>
            . Manage-leads continues to use the V1 widget configurator storage until you wire production to V2.
          </p>
        </div>
        <Link
          href="/developer/widgets-config-v2"
          className="inline-flex shrink-0 items-center rounded-lg border border-[#34369C]/30 bg-white px-3 py-2 font-outfit text-xs font-semibold text-[#34369C] shadow-sm hover:bg-[#f4f5ff]"
        >
          Edit in V2 canvas
        </Link>
      </div>

      <section
        className="flex min-h-0 w-full min-w-0 flex-1 flex-col lg:min-h-[min(78vh,920px)]"
        aria-label="Lead detail preview"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-500/30 bg-[#c9cfdb] p-2 shadow-[inset_0_2px_10px_rgba(255,255,255,0.28)] md:p-3">
          <div className="flex h-[min(72vh,860px)] min-h-[min(520px,70vh)] w-full flex-1 flex-col overflow-hidden rounded-xl border-2 border-white bg-white shadow-[0_14px_44px_-12px_rgba(31,23,80,0.28)] ring-1 ring-[#34369C]/15 lg:h-[min(78vh,920px)] lg:max-h-[calc(100dvh-6rem)]">
            <div className="flex min-h-0 flex-1 flex-col">
              <LeadDetailPagePreview
                builderCanvas
                lead={lead}
                leftRailFieldIds={orderedVisibleIds}
                onLeadPatch={onLeadPatch}
                onStageChange={onStageChange}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
