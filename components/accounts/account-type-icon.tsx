import {
  Banknote,
  CreditCard,
  Landmark,
  LineChart,
  PiggyBank,
  Scale,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "@/types";

export const ACCOUNT_TYPE_ICON: Record<AccountType, LucideIcon> = {
  cash: Banknote,
  bank: Landmark,
  credit_card: CreditCard,
  wallet: Wallet,
  investment: LineChart,
  other_asset: PiggyBank,
  loan: Scale,
};

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  cash: "Cash",
  bank: "Bank Account",
  credit_card: "Credit Card",
  wallet: "Wallet",
  investment: "Investment Account",
  other_asset: "Other Asset",
  loan: "Loan",
};
