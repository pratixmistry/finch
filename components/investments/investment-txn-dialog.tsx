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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { useLogInvestmentTransaction } from "@/hooks/use-investments";
import {
  investmentTxnFormSchema,
  type InvestmentTxnFormValues,
} from "@/lib/validations/investment";
import { toInputDate } from "@/lib/formatters/date";
import type { Investment, InvestmentTxnType } from "@/types";

function defaults(type: InvestmentTxnType): InvestmentTxnFormValues {
  return {
    type,
    quantity: 0,
    price: 0,
    fees: 0,
    transactionDate: toInputDate(new Date()),
    notes: "",
  };
}

export function InvestmentTxnDialog({
  investment,
  type,
  open,
  onOpenChange,
}: {
  investment: Investment | null;
  type: InvestmentTxnType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const logTxn = useLogInvestmentTransaction();

  const form = useForm<InvestmentTxnFormValues>({
    resolver: zodResolver(investmentTxnFormSchema),
    defaultValues: defaults(type),
  });

  React.useEffect(() => {
    if (open) form.reset(defaults(type));
  }, [open, type, form]);

  async function onSubmit(values: InvestmentTxnFormValues) {
    if (!investment) return;
    try {
      await logTxn.mutateAsync({ investment, input: values });
      toast.success(type === "buy" ? "Buy logged" : "Sell logged");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === "buy" ? "Log a buy" : "Log a sell"}</DialogTitle>
          <DialogDescription>
            {investment?.name}
            {type === "sell" && investment ? ` · currently holding ${investment.quantity}` : ""}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          type="number"
                          inputMode="decimal"
                          step="0.000001"
                          placeholder="0"
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per unit</FormLabel>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Fees <span className="text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes <span className="text-muted-foreground font-normal">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={logTxn.isPending}>
                {logTxn.isPending && <Loader2 className="size-4 animate-spin" />}
                {type === "buy" ? "Log buy" : "Log sell"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
