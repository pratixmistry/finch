import { z } from "zod";

export const INVESTMENT_ASSET_TYPE_OPTIONS = [
  { value: "stock", label: "Stock" },
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "etf", label: "ETF" },
  { value: "crypto", label: "Crypto" },
  { value: "fixed_deposit", label: "Fixed Deposit" },
  { value: "bond", label: "Bond" },
  { value: "other", label: "Other" },
] as const;

export const investmentFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(80),
  assetType: z.enum(["stock", "mutual_fund", "etf", "crypto", "fixed_deposit", "bond", "other"]),
  symbol: z.string().trim().max(20).optional(),
  accountId: z.string().min(1, { message: "Choose an account" }),
  quantity: z.coerce.number().min(0).max(999_999_999),
  averageBuyPrice: z.coerce.number().min(0).max(999_999_999),
  currentPrice: z.coerce.number().min(0).max(999_999_999),
});

export type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

export const investmentTxnFormSchema = z.object({
  type: z.enum(["buy", "sell"]),
  quantity: z.coerce.number().positive({ message: "Enter a quantity greater than 0" }),
  price: z.coerce.number().min(0),
  fees: z.coerce.number().min(0),
  transactionDate: z.string().min(1),
  notes: z.string().optional(),
});

export type InvestmentTxnFormValues = z.infer<typeof investmentTxnFormSchema>;
