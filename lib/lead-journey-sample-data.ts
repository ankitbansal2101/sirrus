import { CONFIGURATOR_V1_PREVIEW_JOURNEY } from "@/lib/configurator-v1-preview-content";
import { getLeadDetailDataProfile } from "@/lib/lead-detail-fixtures";
import type { JourneyDay } from "@/lib/lead-journey-types";
import type { LeadRow } from "@/lib/leads-sample-data";

/** Rich demo timeline matching prod “Kawal Lead Prasun” journey (subset of events). */
const KAWAL_LEAD_JOURNEY: JourneyDay[] = [
  {
    dateLabel: "10/04/2026",
    events: [
      {
        type: "fieldUpdate",
        field: "Stage",
        oldValue: "Negotiation",
        newValue: "Booked",
        timeLabel: "07:31 PM",
        actorName: "kawal gulati",
        blueprintRows: [
          { label: "Booking ID", value: "B0426000073" },
          { label: "Owner Name", value: "Akc" },
          { label: "Unit No.", value: "Tower 1, 205" },
          { label: "Unit Type", value: "3 BHK" },
          { label: "Agreement value", value: "₹ 0" },
          { label: "Token Amount", value: "₹ 0" },
        ],
      },
    ],
  },
  {
    dateLabel: "01/04/2026",
    events: [
      {
        type: "structured",
        kind: "call.missed",
        headline: "kawal gulati Missed Call from Kawal Lead Prasun at 09:35 AM",
        timeLabel: "09:35 AM",
        actorName: "kawal gulati",
      },
      {
        type: "remark",
        kind: "text",
        text: "No answer on first attempt — will call again after lunch.",
        timeLabel: "09:39 AM",
        actorName: "kawal gulati",
      },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "abc",
        timeLabel: "09:40 AM",
        actorName: "kawal gulati",
      },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "Not Added",
        timeLabel: "06:19 PM",
        actorName: "kawal gulati",
      },
    ],
  },
  {
    dateLabel: "31/03/2026",
    events: [
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:08 min",
        status: "Interested",
        subStatus: "Callback requested",
        remarks: "Incoming kawal call disposition feedback",
        showUpdate: true,
        scrubLabel: "0:06",
        timeLabel: "02:57 PM",
        actorName: "kawal gulati",
        audioSrc:
          "https://s3tcglsqa.s3.ap-south-1.amazonaws.com/calls/DXP/8607040494/1774953276919.mp3",
      },
      {
        type: "remark",
        kind: "text",
        text: "Lead confirmed weekend slot works; asked for brochure and payment plan PDF to be emailed before the site visit. Mentioned spouse will join the second walkthrough.",
        timeLabel: "03:00 PM",
        actorName: "kawal gulati",
      },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "Not Added",
        timeLabel: "04:06 PM",
        aiSummary: {
          timeLabel: "04:05 PM",
          bullets: ["This transcript is empty. Therefore, no summary can be generated."],
          nextSteps:
            "Since there is no information available, the agent should focus on gathering basic information about the lead's requirements and preferences.",
        },
      },
      {
        type: "structured",
        kind: "lead.reassign",
        headline: "Lead Reassigned to kawaljeet NonAdmin by Sunil Sabat at 04:07 PM",
        timeLabel: "04:07 PM",
        actorName: "Sunil Sabat",
      },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "Not Added",
        timeLabel: "04:09 PM",
      },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:00 min",
        remarks: "Working",
        timeLabel: "05:39 PM",
        actorName: "Sunil Sabat",
      },
    ],
  },
  {
    dateLabel: "30/03/2026",
    events: [
      {
        type: "fieldUpdate",
        field: "Name",
        oldValue: "Kawal Lead",
        newValue: "Kawal Lead Prasun",
        timeLabel: "03:45 PM",
        actorName: "Vishakh G",
      },
      {
        type: "fieldUpdate",
        field: "Lead source",
        oldValue: "Portal",
        newValue: "Others",
        timeLabel: "03:45 PM",
        actorName: "Vishakh G",
      },
      {
        type: "fieldUpdate",
        field: "Lead sub source",
        oldValue: "—",
        newValue: "abc",
        timeLabel: "03:46 PM",
        actorName: "Vishakh G",
      },
      {
        type: "fieldUpdate",
        field: "Stage",
        oldValue: "Contacted",
        newValue: "Qualified",
        timeLabel: "03:47 PM",
        actorName: "Vishakh G",
        blueprintRows: [
          { label: "Budget", value: "₹ 1.2 Cr" },
          { label: "Follow-up task", value: "Callback — 2 Apr, 10:00 AM" },
          { label: "Remarks", value: "Strong interest; prefers sea-facing." },
        ],
      },
      {
        type: "comment",
        author: "Vishakh G",
        dateLabel: "30/03/2026",
        timeLabel: "03:46 PM",
        body: "Follow-up scheduled for next week.",
        followupLabel: "Status: 30th Mar, 05:01PM",
      },
      {
        type: "callFeedback",
        dot: true,
        durationLabel: "00:15 min",
        status: "Not Added",
        subStatus: "Not Added",
        remarks: "abc",
        showUpdate: true,
        scrubLabel: "0:13",
        timeLabel: "03:48 PM",
        actorName: "Vishakh G",
        audioSrc:
          "https://s3tcglsqa.s3.ap-south-1.amazonaws.com/calls/DXP/8607040494/1774865894126.mp3",
        aiSummary: {
          timeLabel: "03:48 PM",
          bullets: [
            "- Agent initiated call to check task.",
            "- Lead confirmed call connection.",
            "- Agent ended call.",
          ],
          nextSteps:
            "No action is needed based on this brief interaction. Wait for the next interaction.",
        },
      },
    ],
  },
  {
    dateLabel: "12/02/2026",
    events: [
      {
        type: "structured",
        kind: "lead.addition",
        headline: "New Lead added by Kawal Gulati at 07:16 PM",
        timeLabel: "07:16 PM",
        actorName: "Kawal Gulati",
      },
      {
        type: "structured",
        kind: "lead.manual_upload",
        headline: "New Lead uploaded manually at 07:18 PM",
        timeLabel: "07:18 PM",
      },
      {
        type: "structured",
        kind: "view.masked.whatsapp",
        headline: "Kawal Gulati viewed WhatsApp Number at 07:19 PM",
        timeLabel: "07:19 PM",
        actorName: "Kawal Gulati",
      },
      {
        type: "structured",
        kind: "sv.feedback.customer",
        headline: "Received Site Visit Feedback at 07:22 PM",
        timeLabel: "07:22 PM",
        actorName: "System",
        rows: [
          { label: "Visit date", value: "12/02/2026" },
          { label: "Interest", value: "Warm" },
        ],
      },
    ],
  },
];

const EMPTY_JOURNEY: JourneyDay[] = [];

/** Short timeline for non-Kawal journey UI tests (fixtures). */
const FIXTURE_SMALL_JOURNEY: JourneyDay[] = [
  {
    dateLabel: "15/04/2026",
    events: [
      {
        type: "remark",
        kind: "text",
        text: "Fixture: follow-up remark logged (sample journey).",
        timeLabel: "10:12 AM",
        actorName: "System",
      },
      {
        type: "fieldUpdate",
        field: "Stage",
        oldValue: "New",
        newValue: "Prospects",
        timeLabel: "02:15 PM",
        actorName: "Fixture User",
      },
    ],
  },
  {
    dateLabel: "14/04/2026",
    events: [
      {
        type: "remark",
        kind: "text",
        text: "Fixture: new lead created from portal.",
        actorName: "System",
      },
    ],
  },
];

export function getJourneyForLead(lead: LeadRow): JourneyDay[] {
  const p = getLeadDetailDataProfile(lead);
  if (p === "kawal") return KAWAL_LEAD_JOURNEY;
  if (p === "org_admin_preview") return CONFIGURATOR_V1_PREVIEW_JOURNEY;
  if (p === "small_journey") return FIXTURE_SMALL_JOURNEY;
  return EMPTY_JOURNEY;
}
