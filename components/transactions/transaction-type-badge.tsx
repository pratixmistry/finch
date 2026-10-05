import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, TrendingUp, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/categories/category-icon";
import { IconTile, type IconTileTone } from "@/components/shared/icon-tile";
import { cn } from "@/lib/utils";
import type { Transaction, TransactionType } from "@/types";

// Single source for how each transaction type looks: money in points down-left,
// money out points up-right.
export const TRANSACTION_TYPE_META: Record<
  TransactionType,
  { label: string; icon: LucideIcon; tone: IconTileTone; className: string }
> = {
  income: { label: "Income", icon: ArrowDownLeft, tone: "income", className: "bg-income/10 text-income" },
  expense: { label: "Expense", icon: ArrowUpRight, tone: "expense", className: "bg-expense/10 text-expense" },
  investment: {
    label: "Investment",
    icon: TrendingUp,
    tone: "investment",
    className: "bg-investment/10 text-investment",
  },
  transfer: { label: "Transfer", icon: ArrowLeftRight, tone: "transfer", className: "bg-transfer/10 text-transfer" },
};

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  const { label, icon: Icon, className } = TRANSACTION_TYPE_META[type];
  return (
    <Badge variant="secondary" className={cn("border-transparent", className)}>
      <Icon />
      {label}
    </Badge>
  );
}

// Leading icon for a transaction row: the category's own icon and color when
// it has one, otherwise the type's.
export function TransactionIcon({
  transaction,
  size = "md",
}: {
  transaction: Pick<Transaction, "type" | "category">;
  size?: "sm" | "md";
}) {
  const { category, type } = transaction;
  if (category) {
    return (
      <IconTile color={category.color} size={size}>
        <CategoryIcon name={category.icon} />
      </IconTile>
    );
  }
  const meta = TRANSACTION_TYPE_META[type];
  return <IconTile icon={meta.icon} tone={meta.tone} size={size} />;
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
