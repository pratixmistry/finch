"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DATE_RANGE_PRESET_LABELS,
  getDateRangeForPreset,
  getPreviousPeriod,
  type DateRange,
  type DateRangePreset,
} from "@/lib/date-range/presets";

const PRESET_PARAM = "range";
const FROM_PARAM = "from";
const TO_PARAM = "to";

function isPreset(value: string | null): value is DateRangePreset {
  return !!value && value in DATE_RANGE_PRESET_LABELS;
}

// Single source of truth for "which period is the dashboard/reports looking
// at right now" — synced to the URL so a filtered view is shareable and
// survives a refresh. Every chart/KPI on a page should derive from one call
// to this hook instead of maintaining its own date state.
export function useDateRange(defaultPreset: DateRangePreset = "this-month") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetParam = searchParams.get(PRESET_PARAM);
  const preset: DateRangePreset = isPreset(presetParam) ? presetParam : defaultPreset;

  const customFrom = searchParams.get(FROM_PARAM);
  const customTo = searchParams.get(TO_PARAM);
  const custom: DateRange | undefined = React.useMemo(
    () =>
      preset === "custom" && customFrom && customTo
        ? { from: new Date(customFrom), to: new Date(customTo) }
        : undefined,
    [preset, customFrom, customTo]
  );

  const range = React.useMemo(() => {
    if (preset === "custom" && !custom) {
      return getDateRangeForPreset("this-month");
    }
    return getDateRangeForPreset(preset, new Date(), custom);
  }, [preset, custom]);

  const previousRange = React.useMemo(
    () => getPreviousPeriod(range, preset),
    [range, preset]
  );

  const setPreset = React.useCallback(
    (next: DateRangePreset, customRange?: DateRange) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(PRESET_PARAM, next);
      if (next === "custom" && customRange) {
        params.set(FROM_PARAM, customRange.from.toISOString().slice(0, 10));
        params.set(TO_PARAM, customRange.to.toISOString().slice(0, 10));
      } else {
        params.delete(FROM_PARAM);
        params.delete(TO_PARAM);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return { preset, range, previousRange, setPreset };
}
