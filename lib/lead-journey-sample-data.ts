import { CONFIGURATOR_V1_PREVIEW_JOURNEY } from "@/lib/configurator-v1-preview-content";
import { getLeadDetailDataProfile } from "@/lib/lead-detail-fixtures";
import type { JourneyDay } from "@/lib/lead-journey-types";
import type { LeadRow } from "@/lib/leads-sample-data";

/** Rich demo timeline matching prod “Kawal Lead Prasun” journey (subset of events). */
const KAWAL_LEAD_JOURNEY: JourneyDay[] = [
  {
    dateLabel: "10/04/2026",
    events: [
      { type: "note", text: "Booking done by kawal gulati at 07:30 PM" },
      {
        type: "booking",
        rows: [
          { label: "Booking ID", value: "B0426000073" },
          { label: "Owner Name", value: "Akc" },
          { label: "Unit No.", value: "Tower 1, 205" },
          { label: "Unit Type", value: "3 BHK" },
          { label: "Agreement value", value: "₹ 0" },
          { label: "Token Amount", value: "₹ 0" },
        ],
      },
      { type: "note", text: "Stage Updated to Booked by kawal gulati at 07:30 PM" },
    ],
  },
  {
    dateLabel: "01/04/2026",
    events: [
      { type: "note", text: "kawal gulati Called Kawal Lead Prasun at 09:39 AM" },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "abc",
      },
      { type: "note", text: "kawal gulati Called Kawal Lead Prasun at 06:18 PM" },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "Not Added",
      },
    ],
  },
  {
    dateLabel: "31/03/2026",
    events: [
      { type: "note", text: "kawal gulati Called Kawal Lead Prasun at 02:56 PM" },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:08 min",
        remarks: "Incoming kawal call disposition feedback",
        scrubLabel: "0:06",
        audioSrc:
          "https://s3tcglsqa.s3.ap-south-1.amazonaws.com/calls/DXP/8607040494/1774953276919.mp3",
      },
      {
        type: "aiSummary",
        timeLabel: "04:05 PM",
        bullets: [
          "This transcript is empty. Therefore, no summary can be generated.",
        ],
        nextSteps:
          "Since there is no information available, the agent should focus on gathering basic information about the lead's requirements and preferences.",
      },
      { type: "note", text: "Kawal Lead Prasun Called Kawal Gulati at 04:06 PM" },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "Not Added",
      },
      { type: "note", text: "Lead Reassigned to kawaljeet NonAdmin by Sunil Sabat at  04:07 PM" },
      { type: "note", text: "Kawal Lead Prasun Called kawaljeet NonAdmin at 04:09 PM" },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "Not Added",
      },
      { type: "note", text: "Sunil Sabat Called Kawal Lead Prasun at 05:38 PM" },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "Working",
      },
    ],
  },
  {
    dateLabel: "30/03/2026",
    events: [
      { type: "note", text: "Vishakh G Updated Lead Information" },
      { type: "note", text: "Lead Source updated to Others by Vishakh G at 03:46 PM" },
      { type: "note", text: "Lead Sub Source updated to abc by Vishakh G at 03:46 PM" },
      { type: "note", text: "Vishakh G added a comment at 03:46 PM" },
      {
        type: "comment",
        author: "Vishakh G",
        dateLabel: "30/03/2026",
        timeLabel: "03:46 PM",
        followupLabel: "Status: 30th Mar, 05:01PM",
      },
      { type: "note", text: "Vishakh G Called Kawal Lead Prasun at 03:48 PM" },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:15 min",
        remarks: "abc",
        scrubLabel: "0:13",
        audioSrc:
          "https://s3tcglsqa.s3.ap-south-1.amazonaws.com/calls/DXP/8607040494/1774865894126.mp3",
      },
      {
        type: "aiSummary",
        timeLabel: "03:48 PM",
        bullets: [
          "- Agent initiated call to check task.",
          "- Lead confirmed call connection.",
          "- Agent ended call.",
        ],
        nextSteps:
          "No action is needed based on this brief interaction. Wait for the next interaction.",
      },
    ],
  },
  {
    dateLabel: "12/02/2026",
    events: [{ type: "note", text: "New Lead added by Kawal Gulati at 07:16 PM" }],
  },
];

const EMPTY_JOURNEY: JourneyDay[] = [];

/** Short timeline for non-Kawal journey UI tests (fixtures). */
const FIXTURE_SMALL_JOURNEY: JourneyDay[] = [
  {
    dateLabel: "15/04/2026",
    events: [
      { type: "note", text: "Fixture: follow-up note logged (sample journey)." },
      { type: "note", text: "Fixture: stage updated to Prospects (sample)." },
    ],
  },
  {
    dateLabel: "14/04/2026",
    events: [{ type: "note", text: "Fixture: new lead created from portal." }],
  },
];

export function getJourneyForLead(lead: LeadRow): JourneyDay[] {
  const p = getLeadDetailDataProfile(lead);
  if (p === "kawal") return KAWAL_LEAD_JOURNEY;
  if (p === "org_admin_preview") return CONFIGURATOR_V1_PREVIEW_JOURNEY;
  if (p === "small_journey") return FIXTURE_SMALL_JOURNEY;
  return EMPTY_JOURNEY;
}
