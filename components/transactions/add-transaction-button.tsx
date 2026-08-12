"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactionSheet } from "./transaction-sheet-context";

export function AddTransactionButton() {
  const { openCreate } = useTransactionSheet();
  return (
    <Button onClick={() => openCreate()} className="w-fit shrink-0">
      <Plus className="size-4" />
      Add transaction
    </Button>
  );
}
