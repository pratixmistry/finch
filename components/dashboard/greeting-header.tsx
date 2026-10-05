"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
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
    <PageHeader
      title={
        <>
          {greeting(new Date().getHours())}
          {firstName ? `, ${firstName}` : ""}
        </>
      }
      description="Here's your financial overview."
    >
      <Button onClick={() => openCreate()}>
        <Plus />
        Add transaction
      </Button>
    </PageHeader>
  );
}
