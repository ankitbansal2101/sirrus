const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** LUD format DD.MM.YYYY → "10 Apr 2026" */
export function formatLudDisplay(lud: string): string {
  const m = lud.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return lud;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = m[3];
  if (mo < 1 || mo > 12) return lud;
  return `${d} ${MONTHS[mo - 1]} ${y}`;
}

/** ISO datetime → "25 Mar 2026" */
export function formatIsoDateDisplay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
