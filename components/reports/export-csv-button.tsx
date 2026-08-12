"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export/csv";
import type { Transaction } from "@/types";

const HEADER = ["Date", "Type", "Description", "Category", "Account", "Amount", "Notes"];

function toRow(txn: Transaction): (string | number)[] {
  return [
    txn.transactionDate,
    txn.type,
    txn.description,
    txn.type === "transfer" ? `Transfer to ${txn.transferAccount?.name ?? ""}` : (txn.category?.name ?? ""),
    txn.account?.name ?? "",
    txn.amount,
    txn.notes ?? "",
  ];
}

export function ExportCsvButton({
  transactions,
  from,
  to,
}: {
  transactions: Transaction[];
  from: string;
  to: string;
}) {
  function handleExport() {
    if (transactions.length === 0) {
      toast.error("No transactions to export in this period");
      return;
    }
    const rows = [HEADER, ...transactions.map(toRow)];
    downloadCsv(`finch-transactions_${from}_to_${to}.csv`, rows);
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
