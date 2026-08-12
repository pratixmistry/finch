import { format, isThisYear, isToday, isYesterday, parseISO } from "date-fns";

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

// "Today", "Yesterday", "12 Aug" (this year), or "12 Aug 2024" (other years).
export function formatRelativeDate(value: string | Date): string {
  const date = toDate(value);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, isThisYear(date) ? "d MMM" : "d MMM yyyy");
}

export function formatDate(value: string | Date, pattern = "d MMM yyyy"): string {
  return format(toDate(value), pattern);
}

export function formatMonthYear(value: string | Date): string {
  return format(toDate(value), "MMM yyyy");
}

export function formatDayOfMonth(value: string | Date): string {
  return format(toDate(value), "d");
}

export function formatWeekday(value: string | Date): string {
  return format(toDate(value), "EEE");
}

export function toInputDate(value: string | Date): string {
  return format(toDate(value), "yyyy-MM-dd");
}
