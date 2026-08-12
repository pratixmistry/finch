"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useCategories } from "@/hooks/use-categories";
import { useCreateBudget, useUpdateBudget } from "@/hooks/use-budgets";
import { budgetFormSchema, BUDGET_PERIOD_OPTIONS, type BudgetFormValues } from "@/lib/validations/budget";
import { toInputDate } from "@/lib/formatters/date";
import type { Budget } from "@/types";

function toDefaults(budget?: Budget): BudgetFormValues {
  return {
    categoryId: budget?.categoryId ?? "",
    amount: budget?.amount ?? 0,
    period: budget?.period ?? "monthly",
    startDate: budget?.startDate ?? toInputDate(new Date()),
  };
}

export function BudgetFormDialog({
  budget,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  budget?: Budget;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const { data: categories = [] } = useCategories({ type: "expense" });
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const isPending = createBudget.isPending || updateBudget.isPending;
  const isEdit = !!budget;

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: toDefaults(budget),
  });

  React.useEffect(() => {
    if (open) form.reset(toDefaults(budget));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budget?.id]);

  async function onSubmit(values: BudgetFormValues) {
    try {
      if (isEdit && budget) {
        await updateBudget.mutateAsync({ id: budget.id, input: values });
        toast.success("Budget updated");
      } else {
        await createBudget.mutateAsync(values);
        toast.success("Budget added");
      }
      setOpen(false);
    } catch {
      toast.error("A budget for this category and period may already exist.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit budget" : "Add budget"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this spending limit." : "Set a spending limit for a category."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
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
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BUDGET_PERIOD_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start date</FormLabel>
                  <DatePickerField value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add budget"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
