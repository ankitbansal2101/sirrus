/** Operator ids for text filters (company, name, etc.). */
export const TEXT_FILTER_OPERATORS = [
  { id: "contains", label: "Contains" },
  { id: "is", label: "Is" },
  { id: "is_not", label: "Isn't" },
  { id: "does_not_contain", label: "Doesn't contain" },
  { id: "starts_with", label: "Starts with" },
  { id: "ends_with", label: "Ends with" },
] as const;

export type TextFilterOperatorId = (typeof TEXT_FILTER_OPERATORS)[number]["id"];

export const NUM_FILTER_OPERATORS = [
  { id: "lt", label: "Less than (<)" },
  { id: "lte", label: "Less or equal (≤)" },
  { id: "gt", label: "Greater than (>)" },
  { id: "gte", label: "Greater or equal (≥)" },
  { id: "eq", label: "Equals (=)" },
  { id: "neq", label: "Not equals (≠)" },
] as const;

export type NumFilterOperatorId = (typeof NUM_FILTER_OPERATORS)[number]["id"];

/** Relative / range presets for lead dates. */
export const DATE_PRESET_OPERATORS = [
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this_week", label: "This week" },
  { id: "this_month", label: "This month" },
  { id: "this_year", label: "This year" },
  { id: "on", label: "On date" },
  { id: "between", label: "Between" },
  { id: "not_between", label: "Not between" },
] as const;

export type DatePresetOperatorId = (typeof DATE_PRESET_OPERATORS)[number]["id"];

export const DEFAULT_TEXT_OPERATOR: TextFilterOperatorId = "contains";
export const DEFAULT_NUM_OPERATOR: NumFilterOperatorId = "eq";
export const DEFAULT_DATE_PRESET: DatePresetOperatorId = "this_month";
