"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTransactionSheet } from "./transaction-sheet-context";
import { TransactionForm } from "./transaction-form";

export function TransactionSheet() {
  const { state, setOpen, close } = useTransactionSheet();

  return (
    <Sheet open={state.open} onOpenChange={setOpen}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{state.mode === "edit" ? "Edit transaction" : "Add transaction"}</SheetTitle>
          <SheetDescription>
            {state.mode === "edit"
              ? "Update the details of this transaction."
              : "Log income, an expense, an investment, or a transfer between accounts."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {state.open && (
            <TransactionForm
              mode={state.mode}
              transaction={state.transaction}
              defaultType={state.defaultType}
              defaultDate={state.defaultDate}
              onSuccess={close}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
