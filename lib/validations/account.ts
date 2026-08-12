import { z } from "zod";

export const ACCOUNT_TYPE_OPTIONS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Account" },
  { value: "credit_card", label: "Credit Card" },
  { value: "wallet", label: "Wallet" },
  { value: "investment", label: "Investment Account" },
  { value: "other_asset", label: "Other Asset" },
  { value: "loan", label: "Loan / Liability" },
] as const;

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(80),
  type: z.enum([
    "cash",
    "bank",
    "credit_card",
    "wallet",
    "investment",
    "other_asset",
    "loan",
  ]),
  openingBalance: z.coerce.number().min(-999_999_999).max(999_999_999),
  currency: z.string().length(3),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
