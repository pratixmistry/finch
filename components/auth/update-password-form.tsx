"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updatePassword } from "@/lib/actions/auth";
import {
  updatePasswordFormSchema,
  type UpdatePasswordFormValues,
} from "@/lib/validations/auth";

export function UpdatePasswordForm() {
  const [isPending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(values: UpdatePasswordFormValues) {
    setFormError(null);
    startTransition(async () => {
      const result = await updatePassword(values);
      if (result && "error" in result) {
        setFormError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">Set a new password</h2>
        <p className="text-muted-foreground text-sm">
          Choose a new password for your account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError && <p className="text-destructive text-sm">{formError}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Update password
          </Button>
        </form>
      </Form>
    </div>
  );
}
