"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { login } from "@/lib/actions/auth";
import { loginFormSchema, type LoginFormValues } from "@/lib/validations/auth";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [formError, setFormError] = React.useState<string | null>(null);

  const message = searchParams.get("message");
  const linkError = searchParams.get("error");

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    setFormError(null);
    startTransition(async () => {
      const result = await login(values);
      if (result && "error" in result) {
        setFormError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground text-sm">
          Sign in to continue to your dashboard.
        </p>
      </div>

      {message === "check-your-email" && (
        <div className="rounded-lg border border-income/30 bg-income/10 px-3 py-2 text-sm text-income">
          Account created — check your email to confirm before signing in.
        </div>
      )}
      {linkError && (
        <div className="rounded-lg border border-expense/30 bg-expense/10 px-3 py-2 text-sm text-expense">
          That link is invalid or has expired. Please try again.
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/reset-password"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {formError && <p className="text-destructive text-sm">{formError}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </Form>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-foreground font-medium underline-offset-4 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
