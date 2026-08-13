"use client";

import * as React from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { createCalendarDayButton } from "@/components/calendar/calendar-day-button";
import { DayTransactionsPanel } from "@/components/calendar/day-transactions-panel";
import { useTransactionsForRange } from "@/hooks/use-transactions";
import { groupTransactionsByDay, totalExpenses, totalIncome } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatters/currency";
import { formatMonthYear, toInputDate } from "@/lib/formatters/date";

export default function CalendarPage() {
  const [month, setMonth] = React.useState(() => new Date());
  const [selected, setSelected] = React.useState(() => new Date());

  const from = toInputDate(startOfMonth(month));
  const to = toInputDate(endOfMonth(month));
  const { data: transactions, isLoading } = useTransactionsForRange({ from, to });

  const daySummaries = React.useMemo(
    () => groupTransactionsByDay(transactions ?? []),
    [transactions]
  );
  const DayButton = React.useMemo(() => createCalendarDayButton(daySummaries), [daySummaries]);

  const selectedKey = toInputDate(selected);
  const selectedTransactions = React.useMemo(
    () => (transactions ?? []).filter((t) => t.transactionDate === selectedKey),
    [transactions, selectedKey]
  );

  const monthIncome = totalIncome(transactions ?? []);
  const monthExpenses = totalExpenses(transactions ?? []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm">
            Your transactions for {formatMonthYear(month)}, day by day.
          </p>
        </div>
        {!isLoading && (
          <p className="text-muted-foreground text-sm">
            <span className="text-income font-medium">+{formatCurrency(monthIncome)}</span>
            {" · "}
            <span className="text-expense font-medium">-{formatCurrency(monthExpenses)}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
        <div className="bg-card w-fit rounded-xl p-2 shadow-xs ring-1 ring-foreground/10">
          {isLoading ? (
            <Skeleton className="h-80 w-80" />
          ) : (
            <Calendar
              mode="single"
              required
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              onSelect={setSelected}
              className="[--cell-size:--spacing(12)]"
              components={{ DayButton }}
            />
          )}
        </div>

        <DayTransactionsPanel date={selectedKey} transactions={selectedTransactions} isLoading={isLoading} />
      </div>
    </div>
  );
}
