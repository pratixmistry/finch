"use client";

import * as React from "react";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDateRange } from "@/hooks/use-date-range";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { toInputDate } from "@/lib/formatters/date";
import type { DateRangePreset } from "@/lib/date-range/presets";

const OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "this-month", label: "Month" },
  { value: "this-quarter", label: "Quarter" },
  { value: "this-year", label: "Year" },
];

const SEGMENT =
  "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap outline-none transition-[color,background-color,box-shadow] duration-200 ease-out focus-visible:ring-4 focus-visible:ring-ring";
const SEGMENT_ON =
  "bg-card text-foreground shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)] dark:bg-white/15";
const SEGMENT_OFF = "text-muted-foreground hover:text-foreground";

export function DateRangeSelector() {
  const { preset, range, setPreset } = useDateRange();
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customFrom, setCustomFrom] = React.useState(toInputDate(range.from));
  const [customTo, setCustomTo] = React.useState(toInputDate(range.to));

  return (
    <div
      role="group"
      aria-label="Period"
      className="bg-muted flex w-full items-center rounded-full p-0.5 sm:inline-flex sm:w-auto"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={preset === option.value}
          onClick={() => setPreset(option.value)}
          className={cn(SEGMENT, preset === option.value ? SEGMENT_ON : SEGMENT_OFF)}
        >
          {option.label}
        </button>
      ))}

      <Popover open={customOpen} onOpenChange={setCustomOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-pressed={preset === "custom"}
            className={cn(SEGMENT, preset === "custom" ? SEGMENT_ON : SEGMENT_OFF)}
          >
            <CalendarRange className="size-4" />
            Custom
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">From</p>
            <DatePickerField value={customFrom} onChange={setCustomFrom} />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">To</p>
            <DatePickerField value={customTo} onChange={setCustomTo} />
          </div>
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setPreset("custom", {
                from: new Date(`${customFrom}T00:00:00`),
                to: new Date(`${customTo}T00:00:00`),
              });
              setCustomOpen(false);
            }}
          >
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
