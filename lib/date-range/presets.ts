import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";

export type DateRangePreset =
  | "today"
  | "this-week"
  | "this-month"
  | "last-month"
  | "this-quarter"
  | "this-year"
  | "last-year"
  | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
  today: "Today",
  "this-week": "This Week",
  "this-month": "This Month",
  "last-month": "Last Month",
  "this-quarter": "This Quarter",
  "this-year": "This Year",
  "last-year": "Last Year",
  custom: "Custom",
};

// Central place that turns a preset into concrete [from, to] bounds. Nothing
// else in the app should hand-roll startOfMonth/endOfMonth logic.
export function getDateRangeForPreset(
  preset: DateRangePreset,
  reference: Date = new Date(),
  custom?: DateRange
): DateRange {
  switch (preset) {
    case "today":
      return { from: startOfDay(reference), to: endOfDay(reference) };
    case "this-week":
      return {
        from: startOfWeek(reference, { weekStartsOn: 1 }),
        to: endOfWeek(reference, { weekStartsOn: 1 }),
      };
    case "this-month":
      return { from: startOfMonth(reference), to: endOfMonth(reference) };
    case "last-month": {
      const lastMonth = subMonths(reference, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case "this-quarter":
      return { from: startOfQuarter(reference), to: endOfQuarter(reference) };
    case "this-year":
      return { from: startOfYear(reference), to: endOfYear(reference) };
    case "last-year": {
      const lastYear = subYears(reference, 1);
      return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
    }
    case "custom":
      if (!custom) {
        throw new Error("getDateRangeForPreset('custom') requires a custom range");
      }
      return { from: startOfDay(custom.from), to: endOfDay(custom.to) };
  }
}

// The equivalent-length period immediately preceding `range`, used to power
// "vs last month" style KPI comparisons. For calendar presets this lines up
// with the natural previous unit (previous month/quarter/year); for custom
// ranges it's a same-length window immediately before `from`.
export function getPreviousPeriod(
  range: DateRange,
  preset: DateRangePreset,
  reference: Date = new Date()
): DateRange {
  switch (preset) {
    case "today":
      return getDateRangeForPreset("today", subDays(reference, 1));
    case "this-week":
      return getDateRangeForPreset("this-week", subDays(reference, 7));
    case "this-month":
    case "last-month":
      return getDateRangeForPreset("this-month", subMonths(range.from, 1));
    case "this-quarter":
      return getDateRangeForPreset("this-quarter", subQuarters(range.from, 1));
    case "this-year":
    case "last-year":
      return getDateRangeForPreset("this-year", subYears(range.from, 1));
    case "custom": {
      const lengthMs = range.to.getTime() - range.from.getTime();
      const previousTo = subDays(range.from, 1);
      const previousFrom = new Date(previousTo.getTime() - lengthMs);
      return { from: startOfDay(previousFrom), to: endOfDay(previousTo) };
    }
  }
}

export function toISODateRange(range: DateRange): { from: string; to: string } {
  return {
    from: range.from.toISOString().slice(0, 10),
    to: range.to.toISOString().slice(0, 10),
  };
}
