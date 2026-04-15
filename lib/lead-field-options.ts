/** Picklists aligned with the lead form / CRM sample data. */

export const LEAD_SOURCE_OPTIONS = [
  "Digital Marketing",
  "Direct Site Visit",
  "Others",
  "Channel Partner",
  "Referral",
  "Website",
  "Hoarding",
] as const;

export const LEAD_PREFERRED_UNIT_OPTIONS = ["-", "1 BHK", "2 BHK", "3 BHK", "4 BHK", "Plot", "Villa"] as const;

export const LEAD_PROPERTY_STATUS_OPTIONS = ["-", "Ready", "Under construction", "Pre-launch"] as const;

export const LEAD_PURPOSE_OPTIONS = ["-", "Investment", "Personal Use"] as const;

export const LEAD_FUNDING_OPTIONS = ["-", "Loan", "Self funded", "Self Funded"] as const;

export const LEAD_GENDER_OPTIONS = ["-", "Male", "Female", "Other"] as const;

export function selectOptionsWithValue(options: readonly string[], current: string): string[] {
  const c = current.trim();
  if (!c || c === "-") return [...options];
  if (options.includes(c)) return [...options];
  return [c, ...options];
}
