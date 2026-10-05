"use client";

import * as React from "react";
import { endOfMonth, startOfMonth } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
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
    <div className="flex flex-col gap-7">
      <PageHeader title="Calendar" description={<>Your transactions for {formatMonthYear(month)}, day by day.</>}>
        {!isLoading && (
          <p className="text-muted-foreground text-base tabular-nums">
            <span className="text-income font-medium">+{formatCurrency(monthIncome)}</span>
            {" · "}
            <span className="text-expense font-medium">-{formatCurrency(monthExpenses)}</span>
          </p>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[auto_1fr] lg:items-start">
        <div className="surface mx-auto w-fit p-1 sm:p-3 lg:mx-0">
          {isLoading ? (
            <Skeleton className="m-3 h-80 w-72 sm:w-96" />
          ) : (
            <Calendar
              mode="single"
              required
              month={month}
              onMonthChange={setMonth}
              selected={selected}
              onSelect={setSelected}
              className="[--cell-size:--spacing(10)] sm:[--cell-size:--spacing(13)]"
              components={{ DayButton }}
            />
          )}
        </div>

        <DayTransactionsPanel date={selectedKey} transactions={selectedTransactions} isLoading={isLoading} />
      </div>
    </div>
  );
}
