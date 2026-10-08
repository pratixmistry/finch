"use client";

import { defineComponent } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { CategoryIcon } from "@/components/categories/category-icon";
import { IconTile } from "@/components/shared/icon-tile";
import { formatCurrency } from "@/lib/formatters/currency";

const shareSchema = z.object({
  name: z.string(),
  amount: z.number(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

// Rendered by its parent, which needs every row to work out the shares.
export const CategoryShare = defineComponent({
  name: "CategoryShare",
  description:
    "One row of a CategoryBreakdown. amount is a plain number; icon and color come straight from get_spending_by_category.",
  props: shareSchema,
  component: () => null,
});

const schema = z.object({
  items: z.array(CategoryShare.ref),
});

function CategoryBreakdownView({ props }: { props: z.infer<typeof schema> }) {
  const rows = (props.items ?? [])
    .map((item) => item?.props)
    .filter((row): row is z.infer<typeof shareSchema> => !!row && typeof row.amount === "number");
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const max = rows.reduce((top, row) => Math.max(top, row.amount), 0);

  return (
    <ul className="surface flex flex-col px-3 py-2">
      {rows.map((row, index) => (
        <li key={`${row.name}-${index}`} className="flex items-center gap-3 px-2 py-3">
          <IconTile color={row.color ?? "#6366f1"} size="sm">
            <CategoryIcon name={row.icon ?? "circle"} />
          </IconTile>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-base font-medium">{row.name}</span>
              <span className="shrink-0 text-base font-medium tabular-nums">
                {formatCurrency(row.amount)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${max > 0 ? Math.max(2, (row.amount / max) * 100) : 0}%`,
                    backgroundColor: row.color ?? "var(--primary)",
                  }}
                />
              </div>
              <span className="text-muted-foreground w-10 shrink-0 text-right text-sm tabular-nums">
                {total > 0 ? Math.round((row.amount / total) * 100) : 0}%
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export const CategoryBreakdown = defineComponent({
  name: "CategoryBreakdown",
  description:
    "Ranked list of spending by category, each with its icon, amount, share of the total and a bar. Pass items largest first. Prefer this over a pie chart for category spending.",
  props: schema,
  component: CategoryBreakdownView,
});
