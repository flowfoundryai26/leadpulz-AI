import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";

export function formatNumber(n: number, opts: Intl.NumberFormatOptions = {}) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0, ...opts }).format(n);
}

export function formatCompact(n: number) {
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

/** Indian rupee formatting with lakh/crore grouping — e.g. ₹8,42,500 */
export function formatCurrency(n: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPercent(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDurationLong(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function formatDate(iso: string | Date, pattern = "dd MMM yyyy") {
  return format(new Date(iso), pattern);
}

export function formatDateTime(iso: string | Date) {
  return format(new Date(iso), "dd MMM yyyy, hh:mm a");
}

export function formatTime(iso: string | Date) {
  return format(new Date(iso), "hh:mm a");
}

export function formatRelative(iso: string | Date) {
  const d = new Date(iso);
  if (isToday(d)) return `Today, ${format(d, "hh:mm a")}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, "hh:mm a")}`;
  return format(d, "dd MMM, hh:mm a");
}

export function timeAgo(iso: string | Date) {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}

export function maskKey(key: string) {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}••••••••${key.slice(-4)}`;
}
