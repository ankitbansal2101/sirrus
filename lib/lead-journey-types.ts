/** Compact timeline line — `callLog` (called / missed call) or `text` (user remark). */
export type JourneyRemarkEvent = {
  type: "remark";
  /** Inferred from copy when omitted (`Called`, `Missed Call`, … → callLog). */
  kind?: "callLog" | "text";
  text: string;
  /** Left-column time in timeline (e.g. `01:43 PM`). */
  timeLabel?: string;
  /** Shown on metadata line: `by {actorName} {date}`. */
  actorName?: string;
};

/** Single-field audit (see `formatJourneyFieldUpdateSentence`). */
export type JourneyFieldUpdateEvent = {
  type: "fieldUpdate";
  field: string;
  oldValue: string;
  newValue: string;
  /** Blueprint / stage-transition form fields captured with this change (budget, task, remarks, …). */
  blueprintRows?: { label: string; value: string }[];
  timeLabel?: string;
  actorName?: string;
};

/** Booking is modeled as a stage transition with a capture form (`rows`). */
export type JourneyBookingEvent = {
  type: "booking";
  rows: { label: string; value: string }[];
  /** One-line timeline summary; defaults to a short booking label if omitted. */
  summaryLine?: string;
  timeLabel?: string;
  actorName?: string;
};

export type JourneyCallAiSummary = {
  timeLabel?: string;
  bullets: string[];
  nextSteps: string;
};

export type JourneyCallFeedbackEvent = {
  type: "callFeedback";
  /** Purple timeline dot (prod uses for richer call rows) */
  dot?: boolean;
  durationLabel: string;
  remarks: string;
  /** Rendered inside the call widget (not a separate timeline row). */
  aiSummary?: JourneyCallAiSummary;
  /** Call disposition — omit or empty to show “Not Added” in UI */
  status?: string;
  subStatus?: string;
  /** Show prod-style “Update” CTA (wire to mutation when backend exists) */
  showUpdate?: boolean;
  scrubLabel?: string;
  audioSrc?: string;
  timeLabel?: string;
  actorName?: string;
};

export type JourneyAiSummaryEvent = {
  type: "aiSummary";
  timeLabel: string;
  bullets: string[];
  nextSteps: string;
  actorName?: string;
};

export type JourneyCommentEvent = {
  type: "comment";
  author: string;
  dateLabel: string;
  timeLabel: string;
  body?: string;
  followupLabel?: string;
};

/**
 * Typed timeline row for CRM interactions (lead lifecycle, calls, privacy, SV, …).
 * Use a dotted `kind` (e.g. `lead.reassign`, `view.masked.email`) so filters and labels
 * stay consistent; new kinds work without a code change if you only need the default card.
 */
export type JourneyStructuredEvent = {
  type: "structured";
  kind: string;
  /** Summary line (same role as an activity pill). */
  headline: string;
  /** Optional compact key/value block under the headline. */
  rows?: { label: string; value: string }[];
  timeLabel?: string;
  actorName?: string;
};

export type JourneyEvent =
  | JourneyRemarkEvent
  | JourneyFieldUpdateEvent
  | JourneyBookingEvent
  | JourneyCallFeedbackEvent
  | JourneyAiSummaryEvent
  | JourneyCommentEvent
  | JourneyStructuredEvent;

export type JourneyDay = {
  dateLabel: string;
  events: JourneyEvent[];
};
