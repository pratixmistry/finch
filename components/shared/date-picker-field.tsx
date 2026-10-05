"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/formatters/date";
import { cn } from "@/lib/utils";

export function DatePickerField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* Styled as a field, not a button, so it lines up with the inputs around it. */}
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "border-input bg-card focus-visible:border-primary/60 focus-visible:ring-ring/50 aria-expanded:border-primary/60 aria-expanded:ring-ring/50 dark:bg-input/30 flex h-11 w-full items-center gap-2.5 rounded-lg border px-3.5 text-left text-base whitespace-nowrap transition-[border-color,box-shadow] duration-150 ease-out outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 aria-expanded:ring-4",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="text-muted-foreground size-5 shrink-0" />
          <span className="truncate">{selected ? formatDate(selected) : "Pick a date"}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-1">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
              date.getDate()
            ).padStart(2, "0")}`;
            onChange(iso);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
