import { z } from "zod";

export const INVESTMENT_ASSET_TYPE_OPTIONS = [
  { value: "stock", label: "Stock" },
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "etf", label: "ETF" },
  { value: "crypto", label: "Crypto" },
  { value: "fixed_deposit", label: "Fixed Deposit" },
  { value: "recurring_deposit", label: "Recurring Deposit" },
  { value: "bond", label: "Bond" },
  { value: "other", label: "Other" },
] as const;

const ASSET_TYPES = [
  "stock",
  "mutual_fund",
  "etf",
  "crypto",
  "fixed_deposit",
  "recurring_deposit",
  "bond",
  "other",
] as const;

export const investmentFormSchema = z
  .object({
    name: z.string().trim().min(1, { message: "Name is required" }).max(80),
    assetType: z.enum(ASSET_TYPES),
    symbol: z.string().trim().max(20).optional(),
    accountId: z.string().min(1, { message: "Choose an account" }),
    quantity: z.coerce.number().min(0).max(999_999_999),
    averageBuyPrice: z.coerce.number().min(0).max(999_999_999),
    currentPrice: z.coerce.number().min(0).max(999_999_999),
    rdMonthlyAmount: z.coerce.number().min(0).max(999_999_999).optional(),
    rdInterestRate: z.coerce.number().min(0).max(50).optional(),
    rdTenureMonths: z.coerce.number().int().min(0).max(600).optional(),
    rdStartDate: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.assetType !== "recurring_deposit") return;
    if (!values.rdMonthlyAmount || values.rdMonthlyAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rdMonthlyAmount"],
        message: "Enter a monthly amount",
      });
    }
    if (values.rdInterestRate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rdInterestRate"],
        message: "Enter an interest rate",
      });
    }
    if (!values.rdTenureMonths || values.rdTenureMonths <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rdTenureMonths"],
        message: "Enter a tenure",
      });
    }
    if (!values.rdStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rdStartDate"],
        message: "Pick a start date",
      });
    }
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
