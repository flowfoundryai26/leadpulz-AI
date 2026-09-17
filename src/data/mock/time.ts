/**
 * Anchor time for demo data. All mock timestamps are relative to "now" so the
 * demo always looks live, regardless of when it is opened.
 */
const anchor = new Date();
anchor.setSeconds(0, 0);

export const NOW = anchor;

export function minutesAgo(min: number) {
  return new Date(NOW.getTime() - min * 60_000).toISOString();
}

export function hoursAgo(h: number, min = 0) {
  return new Date(NOW.getTime() - h * 3_600_000 - min * 60_000).toISOString();
}

export function daysAgo(d: number, hour = 10, minute = 0) {
  const t = new Date(NOW);
  t.setDate(t.getDate() - d);
  t.setHours(hour, minute, 0, 0);
  return t.toISOString();
}

export function daysFromNow(d: number, hour = 10, minute = 0) {
  const t = new Date(NOW);
  t.setDate(t.getDate() + d);
  t.setHours(hour, minute, 0, 0);
  return t.toISOString();
}

export function addMinutes(iso: string, min: number) {
  return new Date(new Date(iso).getTime() + min * 60_000).toISOString();
}
