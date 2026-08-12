import { z } from "zod";

export const BUDGET_PERIOD_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
] as const;

export const budgetFormSchema = z.object({
  categoryId: z.string().min(1, { message: "Choose a category" }),
  amount: z.coerce.number().positive({ message: "Enter an amount greater than 0" }).max(999_999_999),
  period: z.enum(["monthly", "quarterly", "yearly"]),
  startDate: z.string().min(1),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
