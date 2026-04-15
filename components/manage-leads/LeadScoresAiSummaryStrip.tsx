"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { FaCircle } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import type { LeadAiSummaryStripInsight } from "@/lib/lead-ai-summary-strip-data";

const ink = "rgb(31, 23, 80)";
const bodyMuted = "rgb(126, 122, 149)";
const bodyDark = "rgb(53, 47, 88)";
const labelBlue = "rgb(52, 54, 156)";

const SCORE_CARDS = [
  {
    title: "Perception" as const,
    bg: "rgb(253, 240, 171)",
    border: "rgb(214, 185, 29)",
    detailBg: "rgb(250, 251, 234)",
    detailBorder: "rgb(214, 185, 29)",
    detailText:
      "The customer does not express any opinions or ask questions about the builder's credibility, project quality, or reputation. Therefore, based on the definition, a score of NA is assigned.",
  },
  {
    title: "Ability" as const,
    bg: "rgb(194, 250, 213)",
    border: "rgb(97, 195, 124)",
    detailBg: "rgb(240, 252, 244)",
    detailBorder: "rgb(97, 195, 124)",
    detailText:
      "There is not enough conversation data to assess the lead's financial capacity, decision-making authority, or ability to proceed. A score of NA is assigned until more signals are available.",
  },
  {
    title: "Intent" as const,
    bg: "rgb(197, 235, 255)",
    border: "rgb(56, 127, 210)",
    detailBg: "rgb(240, 249, 255)",
    detailBorder: "rgb(56, 127, 210)",
    detailText:
      "The lead has not yet stated clear purchase intent, timeline, or product preferences in captured interactions. Based on the rubric, a score of NA is assigned.",
  },
  {
    title: "Readiness" as const,
    bg: "rgb(255, 180, 164)",
    border: "rgb(252, 83, 89)",
    detailBg: "rgb(255, 245, 242)",
    detailBorder: "rgb(252, 83, 89)",
    detailText:
      "Readiness to move forward (documentation, visits, or next steps) cannot be determined from current data. A score of NA is assigned pending further engagement.",
  },
];

type PairTitle = (typeof SCORE_CARDS)[number]["title"];

type Props = {
  insight: LeadAiSummaryStripInsight | null;
};

/** Four PAIR score cards (expandable) plus AI Generated Summary — matches product markup. */
export function LeadScoresAiSummaryStrip({ insight }: Props) {
  const hasInsight = insight !== null;
  const summaryBody = hasInsight
    ? insight.summaryBody
    : "No summary available yet, The AI will generate insights once data is added.";
  const nextSteps = hasInsight ? insight.nextSteps : null;
  const lastUpdated = hasInsight ? insight.lastUpdatedLabel : null;

  const [expanded, setExpanded] = useState<PairTitle | null>(null);

  const toggleCard = useCallback((title: PairTitle) => {
    setExpanded((prev) => (prev === title ? null : title));
  }, []);

  const expandedConfig = expanded ? SCORE_CARDS.find((c) => c.title === expanded) : undefined;

  return (
    <div className="shrink-0">
      <div className="flex gap-1">
        <div className="grid w-full grid-cols-2 gap-1.5 sm:gap-2.5 lg:grid-cols-4">
          {SCORE_CARDS.map((card) => {
            const isOpen = expanded === card.title;
            return (
              <div
                key={card.title}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-label={`${card.title}, score NA out of 5. ${isOpen ? "Collapse" : "Expand"} rationale.`}
                className="flex min-w-0 cursor-pointer items-center rounded-xl px-3 py-2.5 outline-none ring-[#34369C] focus-visible:ring-2 sm:rounded-2xl sm:px-3.5 sm:py-3"
                style={{
                  backgroundColor: card.bg,
                  borderColor: card.border,
                  borderWidth: 0,
                }}
                onClick={() => toggleCard(card.title)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleCard(card.title);
                  }
                }}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex min-w-0">
                      <div className="mt-1 text-base font-semibold" style={{ color: ink }}>
                        {card.title}
                      </div>
                      <div className="ml-4 mt-[2px] text-lg font-semibold" style={{ color: ink }}>
                        NA
                        <span className="ml-1 text-xs font-medium" style={{ color: ink }}>
                          /5
                        </span>
                      </div>
                    </div>
                    <IoChevronDown
                      className={`h-[1em] w-[1em] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      style={{ color: ink }}
                      aria-hidden
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {expandedConfig ? (
        <div
          className="mt-2 flex w-full flex-col rounded-2xl p-2.5 sm:mt-3 sm:p-3"
          style={{
            backgroundColor: expandedConfig.detailBg,
            borderColor: expandedConfig.detailBorder,
            borderWidth: 1,
            borderStyle: "solid",
          }}
        >
          <div>
            <div className="flex">
              <FaCircle className="mr-2 mt-2 shrink-0" size={5} style={{ color: ink }} aria-hidden />
              <span className="w-full font-outfit text-sm font-normal" style={{ color: labelBlue }}>
                <span className="font-outfit text-sm font-normal" style={{ color: ink }}>
                  {expandedConfig.detailText}
                </span>
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="mt-2 w-full rounded-[1.25rem] border-[0.0875rem] border-transparent bg-origin-border p-3 sm:mt-3 sm:rounded-[1.75rem] sm:p-4 [background-clip:padding-box,border-box]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.898), rgba(255, 255, 255, 0.898)), linear-gradient(109.4deg, rgb(10, 216, 234) -9.52%, rgb(98, 48, 201) 55.34%, rgb(230, 128, 178) 125.99%)",
        }}
      >
        <div className="flex flex-row">
          <Image
            src="/assets/images/aiSummaryIcon.svg"
            alt="ai generated summary"
            width={32}
            height={32}
            className="mb-1 mr-1"
          />
          <Image
            src="/assets/images/aiGeneratedSummary.svg"
            alt="ai generated summary"
            width={150}
            height={32}
            className="ml-2 h-8 w-44"
          />
        </div>
        <div className="my-2 h-[0.8px] w-full" style={{ backgroundColor: "rgb(98, 92, 135)" }} />

        <div className="mt-1 flex">
          <FaCircle className="mr-2 mt-2 shrink-0" style={{ color: hasInsight ? bodyDark : bodyMuted }} size={5} />
          <span className="w-full font-outfit text-sm font-normal" style={{ color: labelBlue }}>
            <span className="font-outfit text-sm font-normal" style={{ color: hasInsight ? bodyDark : bodyMuted }}>
              {summaryBody}
            </span>
          </span>
        </div>

        {nextSteps ? (
          <div className="mt-1 flex">
            <FaCircle className="mr-2 shrink-0" style={{ color: labelBlue, marginTop: 8 }} size={5} />
            <span className="w-full font-outfit text-sm font-normal" style={{ color: labelBlue }}>
              Next Steps :{" "}
              <span className="font-outfit text-sm font-normal" style={{ color: bodyDark }}>
                {nextSteps}
              </span>
            </span>
          </div>
        ) : null}

        {lastUpdated ? (
          <div className="mt-2 flex w-full justify-end">
            <span className="mt-2 text-right font-outfit text-xs font-medium" style={{ color: "rgb(126, 122, 149)" }}>
              Last Updated on: {lastUpdated}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
