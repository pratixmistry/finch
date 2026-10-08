"use client";

import { defineComponent } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { CategoryIcon } from "@/components/categories/category-icon";
import { IconTile } from "@/components/shared/icon-tile";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters/currency";
import { cn } from "@/lib/utils";

const schema = z.object({
  category: z.string(),
  spent: z.number(),
  limit: z.number(),
  period: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

const PERIOD_LABEL = { monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly" } as const;

function BudgetMeterView({ props }: { props: z.infer<typeof schema> }) {
  const spent = props.spent ?? 0;
  const limit = props.limit ?? 0;
  const isOver = spent > limit;
  const remaining = limit - spent;
  const percent = limit > 0 ? Math.min(100, Math.max(0, (spent / limit) * 100)) : 0;

  return (
    <div className="surface flex flex-col gap-4 p-5">
      <div className="flex min-w-0 items-center gap-3">
        <IconTile color={props.color ?? "#6366f1"}>
          <CategoryIcon name={props.icon ?? "circle"} />
        </IconTile>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{props.category}</p>
          {props.period && (
            <p className="text-muted-foreground text-sm">{PERIOD_LABEL[props.period]}</p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className={cn("text-2xl font-semibold", isOver && "text-expense")}>
            {formatCurrency(spent)}
          </span>
          <span className="text-muted-foreground text-sm tabular-nums">
            of {formatCurrency(limit)}
          </span>
        </div>
        <Progress
          value={percent}
          className="h-2"
          indicatorClassName={isOver ? "bg-expense" : "bg-primary"}
        />
        <p className={cn("text-sm", isOver ? "text-expense" : "text-muted-foreground")}>
          {isOver
            ? `${formatCurrency(Math.abs(remaining))} over budget`
            : `${formatCurrency(remaining)} left this period`}
        </p>
      </div>
    </div>
  );
}

export const BudgetMeter = defineComponent({
  name: "BudgetMeter",
  description:
    "One budget's progress: amount spent against its limit, with a bar and what is left. Amounts are plain numbers. icon and color come straight from list_budgets.",
  props: schema,
  component: BudgetMeterView,
});
