import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types";

const CONFIG: Record<TransactionType, { label: string; icon: typeof ArrowUpCircle; className: string }> = {
  income: { label: "Income", icon: ArrowUpCircle, className: "bg-income/10 text-income" },
  expense: { label: "Expense", icon: ArrowDownCircle, className: "bg-expense/10 text-expense" },
  investment: { label: "Investment", icon: LineChart, className: "bg-investment/10 text-investment" },
  transfer: { label: "Transfer", icon: ArrowLeftRight, className: "bg-transfer/10 text-transfer" },
};

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const { label, icon: Icon, className } = CONFIG[type];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}

export function transactionAmountClass(type: TransactionType) {
  if (type === "income") return "text-income";
  if (type === "expense") return "text-expense";
  if (type === "investment") return "text-investment";
  return "text-foreground";
}

export function transactionAmountSign(type: TransactionType) {
  if (type === "income") return "+";
  if (type === "expense" || type === "investment") return "-";
  return "";
}
