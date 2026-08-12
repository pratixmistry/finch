import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Landmark,
  PiggyBank,
  Settings,
  Tags,
  TrendingUp,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  status: "active" | "soon";
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard, status: "active" },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, status: "active" },
  { href: "/calendar", label: "Calendar", icon: CalendarDays, status: "active" },
  { href: "/budgets", label: "Budgets", icon: PiggyBank, status: "active" },
  { href: "/investments", label: "Investments", icon: TrendingUp, status: "active" },
  { href: "/accounts", label: "Accounts", icon: Landmark, status: "active" },
  { href: "/reports", label: "Reports", icon: BarChart3, status: "active" },
  { href: "/categories", label: "Categories", icon: Tags, status: "active" },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings, status: "active" },
];

// Compact set shown in the mobile bottom bar — the rest lives behind "More".
export const MOBILE_PRIMARY_NAV_ITEMS: NavItem[] = [
  PRIMARY_NAV_ITEMS[0],
  PRIMARY_NAV_ITEMS[1],
  PRIMARY_NAV_ITEMS[5],
];
