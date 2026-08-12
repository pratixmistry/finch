"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  LineChart,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { transactionFormSchema, type TransactionFormValues } from "@/lib/validations/transaction";
import { toInputDate } from "@/lib/formatters/date";
import type { Transaction, TransactionType } from "@/types";

const TYPE_CONFIG: Record<
  TransactionType,
  { label: string; icon: typeof ArrowDownCircle; activeClass: string }
> = {
  expense: {
    label: "Expense",
    icon: ArrowDownCircle,
    activeClass: "bg-expense/10 border-expense/40 text-expense",
  },
  income: {
    label: "Income",
    icon: ArrowUpCircle,
    activeClass: "bg-income/10 border-income/40 text-income",
  },
  investment: {
    label: "Investment",
    icon: LineChart,
    activeClass: "bg-investment/10 border-investment/40 text-investment",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowLeftRight,
    activeClass: "bg-transfer/10 border-transfer/40 text-transfer",
  },
};

function toFormValues(
  transaction: Transaction | null,
  defaultType: TransactionType,
  defaultDate?: string
): TransactionFormValues {
  if (!transaction) {
    return {
      type: defaultType,
      accountId: "",
      categoryId: null,
      transferAccountId: null,
      amount: 0,
      transactionDate: defaultDate ?? toInputDate(new Date()),
      description: "",
      notes: "",
    };
  }
  return {
    type: transaction.type,
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    transferAccountId: transaction.transferAccountId,
    amount: transaction.amount,
    transactionDate: transaction.transactionDate,
    description: transaction.description,
    notes: transaction.notes ?? "",
  };
}

export function TransactionForm({
  mode,
  transaction,
  defaultType,
  defaultDate,
  onSuccess,
}: {
  mode: "create" | "edit";
  transaction: Transaction | null;
  defaultType: TransactionType;
  defaultDate?: string;
  onSuccess: () => void;
}) {
  const { data: accounts = [] } = useAccounts();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const isPending = createTransaction.isPending || updateTransaction.isPending;

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: toFormValues(transaction, defaultType, defaultDate),
  });

  React.useEffect(() => {
    form.reset(toFormValues(transaction, defaultType, defaultDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.id, defaultType, defaultDate]);

  const type = form.watch("type");
  const accountId = form.watch("accountId");
  const { data: categories = [] } = useCategories({
    type: type === "income" ? "income" : "expense",
  });

  async function onSubmit(values: TransactionFormValues) {
    try {
      if (mode === "edit" && transaction) {
        await updateTransaction.mutateAsync({ id: transaction.id, input: values });
        toast.success("Transaction updated");
      } else {
        await createTransaction.mutateAsync(values);
        toast.success("Transaction added");
      }
      onSuccess();
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(TYPE_CONFIG) as TransactionType[]).map((value) => {
                  const config = TYPE_CONFIG[value];
                  const Icon = config.icon;
                  const active = field.value === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => field.onChange(value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors",
                        active ? config.activeClass : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="size-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon>
                    <InputGroupText>₹</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    value={field.value === 0 ? "" : field.value}
                  />
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <DatePickerField value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{type === "transfer" ? "From account" : "Account"}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "transfer" && (
          <FormField
            control={form.control}
            name="transferAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To account</FormLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a destination account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts
                      .filter((account) => account.id !== accountId)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(type === "income" || type === "expense") && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {type === "investment" && (
          <p className="text-muted-foreground bg-muted rounded-lg px-3 py-2 text-xs">
            This records the cash moving out of the account. Detailed holdings
            (units, price, P/L) arrive with the Investments module.
          </p>
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput placeholder="e.g. Swiggy, Salary, Rent" {...field} />
                </InputGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Add any extra detail" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" disabled={isPending} className="mt-2">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {mode === "edit" ? "Save changes" : "Add transaction"}
        </Button>
      </form>
    </Form>
  );
}
