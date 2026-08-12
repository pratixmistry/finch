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
import { Input } from "@/components/ui/input";
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
import { useAccounts } from "@/hooks/use-accounts";
import { useCreateInvestment, useUpdateInvestment } from "@/hooks/use-investments";
import {
  investmentFormSchema,
  INVESTMENT_ASSET_TYPE_OPTIONS,
  type InvestmentFormValues,
} from "@/lib/validations/investment";
import type { Investment } from "@/types";

function toDefaults(investment?: Investment): InvestmentFormValues {
  return {
    name: investment?.name ?? "",
    assetType: investment?.assetType ?? "stock",
    symbol: investment?.symbol ?? "",
    accountId: investment?.accountId ?? "",
    quantity: investment?.quantity ?? 0,
    averageBuyPrice: investment?.averageBuyPrice ?? 0,
    currentPrice: investment?.currentPrice ?? 0,
  };
}

export function InvestmentFormDialog({
  investment,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  investment?: Investment;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const { data: accounts = [] } = useAccounts();
  const createInvestment = useCreateInvestment();
  const updateInvestment = useUpdateInvestment();
  const isPending = createInvestment.isPending || updateInvestment.isPending;
  const isEdit = !!investment;

  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: toDefaults(investment),
  });

  React.useEffect(() => {
    if (open) form.reset(toDefaults(investment));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, investment?.id]);

  async function onSubmit(values: InvestmentFormValues) {
    try {
      if (isEdit && investment) {
        await updateInvestment.mutateAsync({ id: investment.id, input: values });
        toast.success("Holding updated");
      } else {
        await createInvestment.mutateAsync(values);
        toast.success("Holding added");
      }
      setOpen(false);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit holding" : "Add holding"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this holding's details and current price."
              : "Add a stock, fund, or other asset to your portfolio."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Nifty 50 Index Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="assetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INVESTMENT_ASSET_TYPE_OPTIONS.map((opt) => (
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
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Symbol <span className="text-muted-foreground font-normal">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. NIFTYBEES" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.000001"
                        disabled={isEdit}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                        value={field.value === 0 ? "" : field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="averageBuyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg. buy price</FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>₹</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          disabled={isEdit}
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

            {isEdit && (
              <p className="text-muted-foreground bg-muted rounded-lg px-3 py-2 text-xs">
                Quantity and average buy price update automatically when you log a buy or sell.
              </p>
            )}

            <FormField
              control={form.control}
              name="currentPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current price</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon>
                        <InputGroupText>₹</InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        type="number"
                        inputMode="decimal"
                        step="0.01"
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

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? "Save changes" : "Add holding"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
