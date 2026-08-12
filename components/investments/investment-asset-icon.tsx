import { Banknote, Bitcoin, Building2, Landmark, LineChart, PieChart, Receipt, type LucideIcon } from "lucide-react";
import type { InvestmentAssetType } from "@/types";

export const ASSET_TYPE_ICON: Record<InvestmentAssetType, LucideIcon> = {
  stock: LineChart,
  mutual_fund: PieChart,
  etf: Building2,
  crypto: Bitcoin,
  fixed_deposit: Landmark,
  bond: Receipt,
  other: Banknote,
};

export const ASSET_TYPE_LABEL: Record<InvestmentAssetType, string> = {
  stock: "Stock",
  mutual_fund: "Mutual Fund",
  etf: "ETF",
  crypto: "Crypto",
  fixed_deposit: "Fixed Deposit",
  bond: "Bond",
  other: "Other",
};
