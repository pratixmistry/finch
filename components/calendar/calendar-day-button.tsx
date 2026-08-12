"use client";

import * as React from "react";
import { getDefaultClassNames, type DayButton } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toInputDate } from "@/lib/formatters/date";
import { formatCurrencyCompact } from "@/lib/formatters/currency";
import type { DaySummary } from "@/lib/calculations";

// A DayButton for the shadcn Calendar that adds a compact net-amount
// indicator under the day number, sourced from a date -> DaySummary map
// built by the Calendar page. Layout mirrors components/ui/calendar.tsx's
// own CalendarDayButton so selection/today/focus styling stays consistent.
export function createCalendarDayButton(daySummaries: Map<string, DaySummary>) {
  return function CalendarDayButtonWithSummary({
    className,
    day,
    modifiers,
    children,
    ...props
  }: React.ComponentProps<typeof DayButton>) {
    const defaultClassNames = getDefaultClassNames();
    const ref = React.useRef<HTMLButtonElement>(null);
    React.useEffect(() => {
      if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);

    const summary = daySummaries.get(toInputDate(day.date));
    const net = summary ? summary.income - summary.expenses : 0;

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon"
        data-day={day.date.toLocaleDateString()}
        data-selected-single={
          modifiers.selected &&
          !modifiers.range_start &&
          !modifiers.range_end &&
          !modifiers.range_middle
        }
        className={cn(
          "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-0.5 border-0 py-1.5 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground",
          defaultClassNames.day,
          className
        )}
        {...props}
      >
        <span className="text-sm">{children}</span>
        {summary && summary.count > 0 && (
          <span
            className={cn(
              "text-[9px] leading-none font-medium tabular-nums",
              net > 0 ? "text-income" : net < 0 ? "text-expense" : "text-muted-foreground"
            )}
          >
            {net === 0 ? "±0" : formatCurrencyCompact(net)}
          </span>
        )}
      </Button>
    );
  };
}
