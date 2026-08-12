"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionSheet } from "@/components/transactions/transaction-sheet-context";

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function GreetingHeader({ name }: { name: string }) {
  const { openCreate } = useTransactionSheet();
  const firstName = name.split(" ")[0];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {greeting(new Date().getHours())}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-muted-foreground text-sm">Here&apos;s your financial overview.</p>
      </div>
      <Button onClick={() => openCreate()} className="w-fit">
        <Plus className="size-4" />
        Add transaction
      </Button>
    </div>
  );
}
