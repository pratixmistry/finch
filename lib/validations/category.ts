import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(60),
  type: z.enum(["income", "expense"]),
  icon: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { message: "Pick a color" }),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const CATEGORY_COLOR_SWATCHES = [
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
];
