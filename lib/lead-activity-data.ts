import type { LeadRow } from "@/lib/leads-sample-data";

export type LeadRemark = {
  id: string;
  author: string;
  text: string;
  /** Display e.g. "12 Mar 2026, 4:22 PM" */
  timeLabel: string;
};

export type LeadTaskType = "Follow Up" | "Site visit";

export type LeadTaskStatus = "Pending" | "Overdue";

export type LeadOpenTask = {
  id: string;
  title: string;
  taskType: LeadTaskType;
  /** Display due date e.g. "14 Apr 2026" */
  dueLabel: string;
  status: LeadTaskStatus;
};

const KAWAL_REMARKS: LeadRemark[] = [
  { id: "r1", author: "Sunil Sabat", text: "Invalid number", timeLabel: "12 Mar 2026, 5:22 PM" },
  { id: "r2", author: "Vishakh G", text: "CNC — customer not contactable.", timeLabel: "30 Mar 2026, 3:46 PM" },
  { id: "r3", author: "kawal gulati", text: "Working on booking formalities.", timeLabel: "10 Apr 2026, 7:15 PM" },
  { id: "r4", author: "Prasun Adara", text: "Shared unit options for Tower 1.", timeLabel: "09 Apr 2026, 11:04 AM" },
  { id: "r5", author: "Sunil Sabat", text: "Callback scheduled post lunch.", timeLabel: "31 Mar 2026, 2:10 PM" },
  { id: "r6", author: "Vishakh G", text: "Lead prefers weekend visit.", timeLabel: "29 Mar 2026, 6:30 PM" },
];

const KAWAL_TASKS: LeadOpenTask[] = [
  {
    id: "t1",
    title: "Collect token cheque scan",
    taskType: "Follow Up",
    dueLabel: "14 Apr 2026",
    status: "Pending",
  },
  {
    id: "t2",
    title: "Schedule site walkthrough",
    taskType: "Site visit",
    dueLabel: "16 Apr 2026",
    status: "Pending",
  },
  {
    id: "t3",
    title: "Send agreement draft on email",
    taskType: "Follow Up",
    dueLabel: "10 Apr 2026",
    status: "Overdue",
  },
];

const DEMO_REMARKS: LeadRemark[] = [
  { id: "d1", author: "System", text: "Lead created from portal.", timeLabel: "Today, 10:12 AM" },
];

const DEMO_TASKS: LeadOpenTask[] = [
  {
    id: "dt1",
    title: "Qualify budget over call",
    taskType: "Follow Up",
    dueLabel: "15 Apr 2026",
    status: "Pending",
  },
];

export function getRemarksForLead(lead: LeadRow): LeadRemark[] {
  if (lead.id === "4" || lead.leadId === "L0226000001") return KAWAL_REMARKS;
  return DEMO_REMARKS;
}

export function getOpenTasksForLead(lead: LeadRow): LeadOpenTask[] {
  if (lead.id === "4" || lead.leadId === "L0226000001") return KAWAL_TASKS;
  return DEMO_TASKS;
}
