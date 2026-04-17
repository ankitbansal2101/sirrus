import {
  CONFIGURATOR_V1_PREVIEW_REMARKS,
  CONFIGURATOR_V1_PREVIEW_TASKS,
} from "@/lib/configurator-v1-preview-content";
import { getLeadDetailDataProfile } from "@/lib/lead-detail-fixtures";
import type { LeadRow } from "@/lib/leads-sample-data";

export type LeadRemarkSource = "Call feedback form" | "Comment" | "Change Stage";

export type LeadRemark = {
  id: string;
  author: string;
  text: string;
  /** Display e.g. "12 Mar 2026, 4:22 PM" */
  timeLabel: string;
  source: LeadRemarkSource;
  /** Newer remarks have larger values — used for recent first / recent last */
  sortAt: number;
};

export type LeadTaskType = "Follow Up" | "Site visit";

export type LeadTaskStatus = "Pending" | "Overdue" | "Completed";

/** One row in the lead “All tasks” list (open + completed). */
export type LeadTask = {
  id: string;
  taskType: LeadTaskType;
  /** Display due date e.g. "14 Apr 2026" */
  dueLabel: string;
  status: LeadTaskStatus;
};

/** @deprecated Use `LeadTask`. */
export type LeadOpenTask = LeadTask;

const KAWAL_REMARKS: LeadRemark[] = [
  {
    id: "r1",
    author: "Sunil Sabat",
    text: "Invalid number",
    timeLabel: "12 Mar 2026, 5:22 PM",
    source: "Call feedback form",
    sortAt: Date.parse("2026-03-12T12:00:00"),
  },
  {
    id: "r2",
    author: "Vishakh G",
    text: "CNC — customer not contactable.",
    timeLabel: "30 Mar 2026, 3:46 PM",
    source: "Comment",
    sortAt: Date.parse("2026-03-30T15:46:00"),
  },
  {
    id: "r3",
    author: "kawal gulati",
    text: "Working on booking formalities.",
    timeLabel: "10 Apr 2026, 7:15 PM",
    source: "Change Stage",
    sortAt: Date.parse("2026-04-10T19:15:00"),
  },
  {
    id: "r4",
    author: "Prasun Adara",
    text: "Shared unit options for Tower 1.",
    timeLabel: "09 Apr 2026, 11:04 AM",
    source: "Comment",
    sortAt: Date.parse("2026-04-09T11:04:00"),
  },
  {
    id: "r5",
    author: "Sunil Sabat",
    text: "Callback scheduled post lunch.",
    timeLabel: "31 Mar 2026, 2:10 PM",
    source: "Call feedback form",
    sortAt: Date.parse("2026-03-31T14:10:00"),
  },
  {
    id: "r6",
    author: "Vishakh G",
    text: "Lead prefers weekend visit.",
    timeLabel: "29 Mar 2026, 6:30 PM",
    source: "Comment",
    sortAt: Date.parse("2026-03-29T18:30:00"),
  },
];

const KAWAL_TASKS: LeadTask[] = [
  {
    id: "t1",
    taskType: "Follow Up",
    dueLabel: "14 Apr 2026",
    status: "Pending",
  },
  {
    id: "t2",
    taskType: "Site visit",
    dueLabel: "16 Apr 2026",
    status: "Pending",
  },
  {
    id: "t3",
    taskType: "Follow Up",
    dueLabel: "10 Apr 2026",
    status: "Overdue",
  },
  {
    id: "t4",
    taskType: "Follow Up",
    dueLabel: "08 Apr 2026",
    status: "Completed",
  },
];

const DEMO_REMARKS: LeadRemark[] = [
  {
    id: "d1",
    author: "System",
    text: "Lead created from portal.",
    timeLabel: "Today, 10:12 AM",
    source: "Comment",
    sortAt: Date.parse("2026-04-12T10:12:00"),
  },
];

const DEMO_TASKS: LeadTask[] = [
  {
    id: "dt1",
    taskType: "Follow Up",
    dueLabel: "15 Apr 2026",
    status: "Pending",
  },
  {
    id: "dt2",
    taskType: "Site visit",
    dueLabel: "12 Apr 2026",
    status: "Completed",
  },
];

export function getRemarksForLead(lead: LeadRow): LeadRemark[] {
  const p = getLeadDetailDataProfile(lead);
  if (p === "kawal") return KAWAL_REMARKS;
  if (p === "org_admin_preview") return CONFIGURATOR_V1_PREVIEW_REMARKS;
  if (p === "empty_all" || p === "empty_activity") return [];
  return DEMO_REMARKS;
}

/** All tasks for the lead (pending, overdue, and completed). */
export function getTasksForLead(lead: LeadRow): LeadTask[] {
  const p = getLeadDetailDataProfile(lead);
  if (p === "kawal") return KAWAL_TASKS;
  if (p === "org_admin_preview") return CONFIGURATOR_V1_PREVIEW_TASKS;
  if (p === "empty_all" || p === "empty_activity") return [];
  return DEMO_TASKS;
}

/** @deprecated Use `getTasksForLead`. */
export const getOpenTasksForLead = getTasksForLead;
