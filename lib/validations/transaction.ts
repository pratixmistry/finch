import { z } from "zod";

// A flat schema (rather than a discriminated union) on purpose: the Add/Edit
// Transaction sheet is a single form whose fields change visibility based on
// `type`, so a flat shape is what react-hook-form needs to drive one set of
// fields. Cross-field rules (category required for income/expense, transfer
// destination required + different from the source account) are enforced in
// superRefine instead of at the type level.
export const transactionFormSchema = z
  .object({
    type: z.enum(["income", "expense", "investment", "transfer"]),
    accountId: z.string().uuid({ message: "Choose an account" }),
    categoryId: z.string().uuid().nullable().optional(),
    transferAccountId: z.string().uuid().nullable().optional(),
    amount: z.coerce
      .number()
      .positive({ message: "Amount must be greater than zero" })
      .max(999_999_999, { message: "Amount is too large" }),
    transactionDate: z.string().min(1, { message: "Choose a date" }),
    description: z.string().max(200),
    notes: z.string().max(1000).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if ((data.type === "income" || data.type === "expense") && !data.categoryId) {
      ctx.addIssue({ code: "custom", message: "Choose a category", path: ["categoryId"] });
    }
    if (data.type === "transfer") {
      if (!data.transferAccountId) {
        ctx.addIssue({
          code: "custom",
          message: "Choose a destination account",
          path: ["transferAccountId"],
        });
      } else if (data.transferAccountId === data.accountId) {
        ctx.addIssue({
          code: "custom",
          message: "Transfer destination must be a different account",
          path: ["transferAccountId"],
        });
      }
    }
  });

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export const TRANSACTION_TYPE_OPTIONS = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
  { value: "investment", label: "Investment" },
  { value: "transfer", label: "Transfer" },
] as const;
