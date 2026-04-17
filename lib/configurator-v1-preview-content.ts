import type { JourneyDay } from "@/lib/lead-journey-types";

/**
 * Generic copy for Widget layout (V1) configurator preview.
 * Shapes match hub / history / AI / journey fixtures (no imports from lead-activity-data to avoid cycles).
 */
export const CONFIGURATOR_V1_PREVIEW_REMARKS = [
  {
    id: "cfg-r1",
    author: "Sam Rivera",
    text: "Unable to reach — line busy.",
    timeLabel: "12 Mar 2026, 5:22 PM",
    source: "Call feedback form" as const,
    sortAt: Date.parse("2026-03-12T12:00:00"),
  },
  {
    id: "cfg-r2",
    author: "Jane Smith",
    text: "Left a voicemail with callback number.",
    timeLabel: "30 Mar 2026, 3:46 PM",
    source: "Comment" as const,
    sortAt: Date.parse("2026-03-30T15:46:00"),
  },
  {
    id: "cfg-r3",
    author: "John Doe",
    text: "Working on booking paperwork.",
    timeLabel: "10 Apr 2026, 7:15 PM",
    source: "Change Stage" as const,
    sortAt: Date.parse("2026-04-10T19:15:00"),
  },
  {
    id: "cfg-r4",
    author: "Alex Morgan",
    text: "Shared floor plans for Tower A.",
    timeLabel: "09 Apr 2026, 11:04 AM",
    source: "Comment" as const,
    sortAt: Date.parse("2026-04-09T11:04:00"),
  },
  {
    id: "cfg-r5",
    author: "Sam Rivera",
    text: "Callback scheduled after 2 PM.",
    timeLabel: "31 Mar 2026, 2:10 PM",
    source: "Call feedback form" as const,
    sortAt: Date.parse("2026-03-31T14:10:00"),
  },
  {
    id: "cfg-r6",
    author: "Jane Smith",
    text: "Lead prefers a Saturday walkthrough.",
    timeLabel: "29 Mar 2026, 6:30 PM",
    source: "Comment" as const,
    sortAt: Date.parse("2026-03-29T18:30:00"),
  },
];

export const CONFIGURATOR_V1_PREVIEW_TASKS = [
  { id: "cfg-t1", taskType: "Follow Up" as const, dueLabel: "14 Apr 2026", status: "Pending" as const },
  { id: "cfg-t2", taskType: "Site visit" as const, dueLabel: "16 Apr 2026", status: "Pending" as const },
  { id: "cfg-t3", taskType: "Follow Up" as const, dueLabel: "10 Apr 2026", status: "Overdue" as const },
  { id: "cfg-t4", taskType: "Follow Up" as const, dueLabel: "08 Apr 2026", status: "Completed" as const },
];

export const CONFIGURATOR_V1_PREVIEW_STATUS_HISTORY = [
  {
    id: "cfg-h1",
    statusLabel: "BOOKED",
    tone: "green" as const,
    modifiedLabel: "10 Apr 2026, 7:30 PM",
    modifiedBy: "Alex Morgan",
  },
  {
    id: "cfg-h2",
    statusLabel: "NEGOTIATION",
    tone: "purple" as const,
    modifiedLabel: "02 Apr 2026, 3:15 PM",
    modifiedBy: "Alex Morgan",
  },
  {
    id: "cfg-h3",
    statusLabel: "SITE REVISIT DONE",
    tone: "yellow" as const,
    modifiedLabel: "25 Mar 2026, 11:20 AM",
    modifiedBy: "Sam Rivera",
  },
  {
    id: "cfg-h4",
    statusLabel: "SITE VISIT DONE",
    tone: "yellow" as const,
    modifiedLabel: "21 Mar 2026, 4:45 PM",
    modifiedBy: "Jane Smith",
  },
  {
    id: "cfg-h5",
    statusLabel: "SITE VISIT PLANNED",
    tone: "yellow" as const,
    modifiedLabel: "20 Mar 2026, 9:30 AM",
    modifiedBy: "Alex Morgan",
  },
];

export const CONFIGURATOR_V1_PREVIEW_AI_INSIGHT = {
  summaryBody:
    "John Doe registered interest in Sample Heights via the website contact form. Early calls went to voicemail; follow-up email was sent. After a site visit the lead moved through negotiation and is now booked. Budget and unit preferences are documented on the lead record; no further AI call transcripts are attached to this preview.",
  nextSteps:
    "Send the welcome pack and coordinate handover with finance. Schedule a post-booking satisfaction check-in within two weeks.",
  lastUpdatedLabel: "15 Apr 2026, 06:27 PM",
};

export const CONFIGURATOR_V1_PREVIEW_JOURNEY: JourneyDay[] = [
  {
    dateLabel: "10/04/2026",
    events: [
      { type: "note", text: "Booking completed by Alex Morgan at 07:30 PM" },
      {
        type: "booking",
        rows: [
          { label: "Booking ID", value: "B0999000001" },
          { label: "Owner Name", value: "John Doe" },
          { label: "Unit No.", value: "Tower A, 1205" },
          { label: "Unit Type", value: "3 BHK" },
          { label: "Agreement value", value: "—" },
          { label: "Token Amount", value: "—" },
        ],
      },
      { type: "note", text: "Stage updated to Booked by Alex Morgan at 07:30 PM" },
    ],
  },
  {
    dateLabel: "01/04/2026",
    events: [
      { type: "note", text: "Alex Morgan called John Doe at 09:39 AM" },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:02 min",
        remarks: "Left voicemail.",
      },
      { type: "note", text: "Alex Morgan called John Doe at 06:18 PM" },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "Not added",
      },
    ],
  },
  {
    dateLabel: "31/03/2026",
    events: [
      { type: "note", text: "Jane Smith updated lead information" },
      { type: "note", text: "Lead source updated to Website by Jane Smith at 03:46 PM" },
      {
        type: "comment",
        author: "Jane Smith",
        dateLabel: "31/03/2026",
        timeLabel: "03:46 PM",
        followupLabel: "Status: 31 Mar, 05:01 PM",
      },
      {
        type: "aiSummary",
        timeLabel: "03:48 PM",
        bullets: [
          "Agent confirmed the lead’s preferred visit window.",
          "Lead asked for parking and accessibility details.",
          "Call ended with a follow-up task created.",
        ],
        nextSteps: "Send directions and a calendar invite for the Saturday tour.",
      },
    ],
  },
  {
    dateLabel: "12/02/2026",
    events: [{ type: "note", text: "New lead added from website by Jane Smith at 07:16 PM" }],
  },
];
