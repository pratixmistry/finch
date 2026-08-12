"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import {
  profileFormSchema,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
  WEEK_START_OPTIONS,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import type { Profile } from "@/types";

function toDefaults(profile?: Profile): ProfileFormValues {
  return {
    fullName: profile?.fullName ?? "",
    currency: profile?.currency ?? "INR",
    timezone: profile?.timezone ?? "Asia/Kolkata",
    dateFormat: profile?.dateFormat ?? "dd/MM/yyyy",
    weekStartDay: profile?.weekStartDay ?? 1,
  };
}

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: toDefaults(profile),
  });

  React.useEffect(() => {
    if (profile) form.reset(toDefaults(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      await updateProfile.mutateAsync(values);
      toast.success("Profile updated");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((opt) => (
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
            name="dateFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date format</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DATE_FORMAT_OPTIONS.map((opt) => (
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <Input placeholder="Asia/Kolkata" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weekStartDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Week starts on</FormLabel>
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WEEK_START_OPTIONS.map((opt) => (
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
        </div>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </Form>
  );
}
