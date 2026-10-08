"use client";

import { defineComponent, useIsStreaming, useStateField } from "@openuidev/react-lang";
import { CircleCheck } from "lucide-react";
import { z } from "zod/v4";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TRANSACTION_TYPE_META } from "@/components/transactions/transaction-type-badge";
import { IconTile } from "@/components/shared/icon-tile";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters/currency";
import { toInputDate } from "@/lib/formatters/date";
import type { Transaction } from "@/types";

const schema = z.object({
  id: z.string(),
  type: z.enum(["expense", "income", "investment", "transfer"]),
  amount: z.number(),
  description: z.string(),
  date: z.string().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  transferAccountId: z.string().optional(),
  notes: z.string().optional(),
});

// The agent never writes to the database. It proposes a transaction as a
// pre-filled form; the person reviews it and the existing form saves it
// through the same validated path the app has always used.
function TransactionDraftView({ props }: { props: z.infer<typeof schema> }) {
  const isStreaming = useIsStreaming();
  // Kept in the thread's form state so a saved draft stays saved on re-render.
  const saved = useStateField(`transaction-draft:${props.id}:saved`);
  const meta = TRANSACTION_TYPE_META[props.type] ?? TRANSACTION_TYPE_META.expense;

  if (saved.value) {
    return (
      <div className="surface flex items-center gap-3 p-4">
        <IconTile icon={CircleCheck} tone="income" />
        <div className="min-w-0">
          <p className="text-base font-medium">{meta.label} saved</p>
          <p className="text-muted-foreground truncate text-sm">
            {formatCurrency(props.amount)}
            {props.description ? ` · ${props.description}` : ""}
          </p>
        </div>
      </div>
    );
  }

  // Props arrive piecemeal while the response streams; wait for the full draft.
  if (isStreaming) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }

  const draft: Transaction = {
    id: `draft:${props.id}`,
    userId: "",
    accountId: props.accountId ?? "",
    categoryId: props.categoryId ?? null,
    transferAccountId: props.transferAccountId ?? null,
    type: props.type,
    amount: props.amount,
    transactionDate: props.date || toInputDate(new Date()),
    description: props.description,
    notes: props.notes ?? null,
    createdAt: "",
  };

  return (
    <div className="surface p-5">
      <TransactionForm
        mode="create"
        transaction={draft}
        defaultType={props.type}
        onSuccess={() => saved.setValue(true)}
      />
    </div>
  );
}

export const TransactionDraft = defineComponent({
  name: "TransactionDraft",
  description:
    "Editable, pre-filled form for recording ONE new transaction. The user reviews and saves it; nothing is written until they do. id is a unique slug; date is YYYY-MM-DD; accountId, categoryId and transferAccountId must be real ids from list_accounts / list_categories.",
  props: schema,
  component: TransactionDraftView,
});
