export type JourneyNoteEvent = {
  type: "note";
  text: string;
};

export type JourneyBookingEvent = {
  type: "booking";
  rows: { label: string; value: string }[];
};

export type JourneyCallFeedbackEvent = {
  type: "callFeedback";
  /** Purple timeline dot (prod uses for richer call rows) */
  dot?: boolean;
  durationLabel: string;
  remarks: string;
  scrubLabel?: string;
  audioSrc?: string;
};

export type JourneyAiSummaryEvent = {
  type: "aiSummary";
  timeLabel: string;
  bullets: string[];
  nextSteps: string;
};

export type JourneyCommentEvent = {
  type: "comment";
  author: string;
  dateLabel: string;
  timeLabel: string;
  body?: string;
  followupLabel?: string;
};

export type JourneyEvent =
  | JourneyNoteEvent
  | JourneyBookingEvent
  | JourneyCallFeedbackEvent
  | JourneyAiSummaryEvent
  | JourneyCommentEvent;

export type JourneyDay = {
  dateLabel: string;
  events: JourneyEvent[];
};
