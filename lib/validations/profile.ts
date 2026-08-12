import { z } from "zod";

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(1, { message: "Enter your name" }).max(120),
  currency: z.string().length(3),
  timezone: z.string().trim().min(1, { message: "Enter a timezone" }).max(60),
  dateFormat: z.string().min(1),
  weekStartDay: z.coerce.number().int().min(0).max(6),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const CURRENCY_OPTIONS = [
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
] as const;

export const DATE_FORMAT_OPTIONS = [
  { value: "dd/MM/yyyy", label: "31/12/2026" },
  { value: "MM/dd/yyyy", label: "12/31/2026" },
  { value: "yyyy-MM-dd", label: "2026-12-31" },
] as const;

export const WEEK_START_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
] as const;
