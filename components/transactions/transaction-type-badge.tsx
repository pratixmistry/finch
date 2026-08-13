import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <Badge variant="secondary" className={cn("border-transparent", className)}>
      <Icon />
      {label}
    </Badge>
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
