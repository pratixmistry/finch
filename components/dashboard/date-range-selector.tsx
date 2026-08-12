"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDateRange } from "@/hooks/use-date-range";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { toInputDate } from "@/lib/formatters/date";
import type { DateRangePreset } from "@/lib/date-range/presets";

const OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: "this-month", label: "This Month" },
  { value: "this-quarter", label: "This Quarter" },
  { value: "this-year", label: "This Year" },
];

export function DateRangeSelector() {
  const { preset, range, setPreset } = useDateRange();
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customFrom, setCustomFrom] = React.useState(toInputDate(range.from));
  const [customTo, setCustomTo] = React.useState(toInputDate(range.to));

  return (
    <div className="bg-muted inline-flex items-center gap-0.5 rounded-lg p-1">
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setPreset(option.value)}
          className={cn(
            "h-7 rounded-md px-2.5 text-xs font-medium shadow-none",
            preset === option.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-transparent"
          )}
        >
          {option.label}
        </Button>
      ))}

      <Popover open={customOpen} onOpenChange={setCustomOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className={cn(
              "h-7 rounded-md px-2.5 text-xs font-medium shadow-none",
              preset === "custom"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            )}
          >
            Custom
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs font-medium">From</p>
            <DatePickerField value={customFrom} onChange={setCustomFrom} />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium">To</p>
            <DatePickerField value={customTo} onChange={setCustomTo} />
          </div>
          <Button
            type="button"
            size="sm"
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
