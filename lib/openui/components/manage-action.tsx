"use client";

import * as React from "react";
import { defineComponent, useIsStreaming } from "@openuidev/react-lang";
import { Plus } from "lucide-react";
import { z } from "zod/v4";
import { AccountFormDialog } from "@/components/accounts/account-form-dialog";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { InvestmentFormDialog } from "@/components/investments/investment-form-dialog";
import { Button } from "@/components/ui/button";

const KINDS = {
  add_account: "Add account",
  add_budget: "Add budget",
  add_expense_category: "Add expense category",
  add_income_category: "Add income category",
  add_holding: "Add holding",
} as const;

type Kind = keyof typeof KINDS;

const schema = z.object({
  kind: z.enum(Object.keys(KINDS) as [Kind, ...Kind[]]),
  label: z.string().optional(),
});

// Opens one of the app's existing create dialogs, so setting up accounts,
// budgets, categories and holdings keeps its validated form.
function ManageActionView({ props }: { props: z.infer<typeof schema> }) {
  const [open, setOpen] = React.useState(false);
  const isStreaming = useIsStreaming();
  const kind = props.kind in KINDS ? props.kind : null;
  if (!kind) return null;

  return (
    <div>
      <Button variant="secondary" disabled={isStreaming} onClick={() => setOpen(true)}>
        <Plus />
        {props.label || KINDS[kind]}
      </Button>
      {kind === "add_account" && <AccountFormDialog open={open} onOpenChange={setOpen} />}
      {kind === "add_budget" && <BudgetFormDialog open={open} onOpenChange={setOpen} />}
      {kind === "add_holding" && <InvestmentFormDialog open={open} onOpenChange={setOpen} />}
      {(kind === "add_expense_category" || kind === "add_income_category") && (
        <CategoryFormDialog
          defaultType={kind === "add_income_category" ? "income" : "expense"}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
}

export const ManageAction = defineComponent({
  name: "ManageAction",
  description:
    "Button that opens Finch's own form for creating an account, budget, category or investment holding. Use it whenever the user wants to add one of these, or needs one before they can continue.",
  props: schema,
  component: ManageActionView,
});
