"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { LeadDetailPagePreview } from "@/components/developer/LeadDetailPagePreview";
import { useLeftRailFieldConfigV2 } from "@/components/manage-leads/useLeftRailFieldConfig";
import { isKawalReferenceLead } from "@/lib/lead-detail-fixtures";
import { SAMPLE_LEADS, type LeadRow } from "@/lib/leads-sample-data";

function pickPreviewLead(): LeadRow {
  const row = SAMPLE_LEADS.find((l) => isKawalReferenceLead(l));
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
    <div className="-mx-8 -mb-8 flex min-h-[calc(100dvh-5.75rem)] w-[calc(100%+4rem)] max-w-none flex-col bg-[#e8ebf4]">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-white/95 px-4 py-2.5 md:px-8">
        <p className="max-w-3xl font-outfit text-xs leading-snug text-[#5c5878]">
          Same lead detail shell as manage leads (track 1). Left-rail fields and per-tab widget layouts follow{" "}
          <Link
            href="/developer/widgets-config-v2"
            className="font-semibold text-[#34369C] underline-offset-2 hover:underline"
          >
            Widgets configurator V2
          </Link>
          .
        </p>
        <Link
          href="/developer/widgets-config-v2"
          className="inline-flex shrink-0 items-center rounded-lg border border-[#34369C]/30 bg-white px-3 py-1.5 font-outfit text-xs font-semibold text-[#34369C] shadow-sm hover:bg-[#f4f5ff]"
        >
          Edit layout
        </Link>
      </div>

      <div className="flex min-h-[min(640px,calc(100dvh-7.5rem))] flex-1 flex-col p-2 md:p-4">
        <LeadDetailPagePreview
          layoutVariant="fullPage"
          showPreviewBadge={false}
          syncV2Configurator
          lead={lead}
          leftRailFieldIds={orderedVisibleIds}
          onLeadPatch={onLeadPatch}
          onStageChange={onStageChange}
        />
      </div>
    </div>
  );
}
